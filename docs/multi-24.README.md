- [Multi-24](#multi-24)
  - [`./package.json`](#packagejson)
  - [`./terraform/scripts/remote_setup.sh`](#terraformscriptsremote_setupsh)
  - [`./terraform/scripts/remote_teardown.sh`](#terraformscriptsremote_teardownsh)

# Multi-24

All of this is just a worse alternative to using something like [ngrok](https://ngrok.com/) to tunnel through to localhost.

## `./package.json`

```json
"scripts" : {
    "remote:setup" : "NODE_ENV=dev ./terraform/scripts/remote_setup.sh",
    "remote:teardown" : "NODE_ENV=dev ./terraform/scripts/remote_teardown.sh"
}
```

- Use `NODE_ENV=dev` to set the environment variable for the execution of the script.

## `./terraform/scripts/remote_setup.sh`

```bash
cd ./terraform
```

- Yarn executes the script relative to `package.json`, so need to change directory containing the Terraform Configuration.

```bash
terraform init
terraform fmt
terraform validate
terraform apply -auto-approve
```

- Setup everything related to Terraform.

```bash
rm -rf terraform.pem | :
```

- Remove the old `terraform.pem` private key if it exists.

```bash
terraform output -raw ssh_private_key > terraform.pem
chmod 400 terraform.pem
```

- Create a new `terraform.pem` file to be used with SSH, and change it's permissions to read-only.
  - `chmod 400 file` - To protect file against accidental overwriting.
    - [3.4.2.1 The `chmod` command](https://www.linuxtopia.org/online_books/introduction_to_linux/linux_The_chmod_command.html)
    - [`chmod` calculator](https://chmodcommand.com/)

```bash
INSTANCE_PUBLIC_IP=$(terraform output -raw instance_public_ip)
```

- Save the created instance's public IP address to a variable, so there's no need to run `terraform output -raw instance_public_ip` every time.

```bash
ssh \
ec2-user@$INSTANCE_PUBLIC_IP \
-i terraform.pem \
-o StrictHostKeyChecking=no \
<< EOF
sudo sed -i "s/#GatewayPorts no/GatewayPorts yes/" /etc/ssh/sshd_config
sudo reboot

EOF
```

- SSH into the instance to modify the `/etc/ssh/sshd_config` to allow port forwarding.
- `sed -i` - edit file in place (makes backup is SUFFIX is supplied) (`--in-place`).

```bash
echo "I sleep"
sleep 20
echo "I still sleep"
sleep 20
echo "I yet still I sleep"
sleep 20
echo "Real s___!?"
```

- Wait for the instance to reboot so that `/etc/ssh/sshd_config` changes can take effect.

```bash
ssh \
-fNtR \
$INSTANCE_PUBLIC_IP:3000:localhost:3000 \
ec2-user@$INSTANCE_PUBLIC_IP \
-i terraform.pem \
-o StrictHostKeyChecking=no
```

- Setup remote port forwarding from port 3000 running on localhost of the local machine to port 3000 on the instance.
- It helps if the app is already running on localhost of the local machine, otherwise there will be error messages about refused connections. The setup process will complete successfully, but the messages can be annoying.

```bash
[ $NODE_ENV = "dev" ] && SLACK_WEBHOOK_URL=$(grep SLACK_WEBHOOK_URL ./scripts/.env.local | cut -d '=' -f 2-) || SLACK_WEBHOOK_URL=$SLACK_WEBHOOK_URL
```

- If running in `dev`, pull the Slack Webhook URL from `.env.local`, otherwise, it will be an environmental variable.
  - This line only exists to make sure that the Slack Webhook URL does not get committed to the repository.
- `grep SLACK_WEBHOOK_URL .env.local` will find the whole line.
- Piping it into `| cut -d '=' -f 2-`:
  - `-d`, `--delimiter=DELIM`: use `DELIM` instead of `TAB` for field delimiter.
    - in this case the delimited is `=`.
  - `-f`, `--fields=LIST`: select only these fields; also print any line that contains no delimiter character, unless the `-s`, `--only-delimited` option is specified.
  - Use one, and only one of `-b`, `--bytes`, `-c`, `--characters` or `-f`. Each list is made up of one range, or many ranges separated by commas. Selected input is written in the same order that it is read, and is written exactly once. Each range is one of:
    - `N` - N'th byte, character or field, counted from 1.
    - `N-` - from N'th byte, character or field, to the end of line.
    - `N-M` - from N'th to M'th (included) byte, character or field.
    - `-M` - from the first to M'th (included) byte, character or field.

```bash
curl \
-X \
POST \
-H 'Content-type: application/json' \
--data '{"text":"'"http://$INSTANCE_PUBLIC_IP:3000"'"}' \
$SLACK_WEBHOOK_URL
```

- Send a message to the `remote-dev` channel in Slack.

## `./terraform/scripts/remote_teardown.sh`

```bash
INSTANCE_PUBLIC_IP=$(terraform output -raw instance_public_ip)
```

- Store the IP address of the instance that's about to be shut down, so that a notification message regarding it's tear-down can be sent to Slack.

```bash
terraform apply -destroy --auto-approve
```

- Teardown all remote infrastructure provisioned by Terraform.

```bash
[ $NODE_ENV = "dev" ] && SLACK_WEBHOOK_URL=$(grep SLACK_WEBHOOK_URL ./scripts/.env.local | cut -d '=' -f 2-) || SLACK_WEBHOOK_URL=$SLACK_WEBHOOK_URL

curl \
-X \
POST \
-H 'Content-type: application/json' \
--data '{"text":"'"http://$INSTANCE_PUBLIC_IP:3000 has been successfully shut down."'"}' \
$SLACK_WEBHOOK_URL`
```

- Send a message to the `remote-dev` channel in Slack regarding the tear-down of the remote.

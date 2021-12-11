# multi-23

```bash
ssh \
-fNtR \
$(terraform output -raw instance_public_ip):3000:localhost:3000 \
ec2-user@$(terraform output -raw instance_public_ip) \
-i terraform.pem \
-o StrictHostKeyChecking=no
```

https://serverfault.com/questions/1064449/port-forwarding-to-local-port-return-err-connection-refused-with-aws-ec2

```bash
sed 's/mellow/green/' hello.txt_old > hello.txt
```

1. Create the instance.
2. Reboot the instance.
3. Execute the line change script in it.
4. PROFIT!!!

Code for testing if the server is already running is in t.sh.

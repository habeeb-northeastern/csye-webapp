#!/bin/bash
sudo chown root:root /home/ec2-user/app/systemd.service
sudo mv /home/ec2-user/app/systemd.service /etc/systemd/system/
sudo chmod 644 /etc/systemd/system/systemd.service

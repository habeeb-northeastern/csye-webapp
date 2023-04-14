#!/bin/bash
sudo chown root:root /home/ec2-user/project/systemd.service
sudo mv /home/ec2-user/project/systemd.service /etc/systemd/system/
sudo chmod 644 /etc/systemd/system/systemd.service

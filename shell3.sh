#!/bin/bash
sudo yum update -y 
sudo yum install -y gcc-c++ make 
curl -sL https://rpm.nodesource.com/setup_16.x | sudo -E bash -
sudo yum update -y
sudo yum install zip unzip
sudo yum install -y nodejs
echo "Setup NodeJS"
sudo yum install -y npm
echo "Installing npm"
node -v
cd project
npm install
npm install winston
npm install hot-shots
npm test
sudo systemctl daemon-reload
sudo systemctl enable systemd.service
sudo systemctl start systemd.service









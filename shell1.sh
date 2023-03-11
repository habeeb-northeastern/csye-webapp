#!/bin/bash
sudo yum update -y 
sudo yum upgrade -y
sudo yum install -y mariadb-server
sudo systemctl start mariadb
mysql -u root -e "SET PASSWORD FOR 'root'@'localhost' = PASSWORD('Coffeebites1$');"
mysql -u root -p'root' -e "CREATE DATABASE IF NOT EXISTS user_management;"
sudo systemctl enable mariadb 
   
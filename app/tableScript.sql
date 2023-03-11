drop database if exists user_db;
create database user_db;
use  user_db;

create table user(
id int AUTO_INCREMENT,
first_name varchar(1000),
last_name varchar(1000),
username varchar(1000),
password varchar(1000),
account_created varchar(1000) ,
account_updated varchar(1000) ,
constraint ps_user_id_pk primary key (id)
);



create table product(
product_id int AUTO_INCREMENT,
name varchar(1000),
description varchar(1000),
sku varchar(1000),
manufacturer varchar(1000),
quantity int ,
date_added varchar(1000) ,
date_last_updated varchar(1000),
owner_user_id integer,
constraint ps_product_id_pk primary key (product_id)
);

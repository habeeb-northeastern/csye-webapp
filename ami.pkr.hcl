variable "ssh_username" {
  type    = string
  default = "ec2-user"
}
variable "aws_account_id" {
  type    = string
  default = "385627822687"
}

variable "aws_access_key" {
  type = string
  default = "AKIASEE4BOWZQWZFG24R"
}
variable "aws_secret_key" {
  type = string
  default = "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"
}
variable "aws_region" {
  type= string
  default = "us-east-1"
}


source "amazon-ebs" "my_ami" {
  ami_name      = "assignment4_${formatdate("YYYY_MM_DD_hh_mm_ss", timestamp())}"
  access_key = var.aws_access_key
  secret_key = var.aws_secret_key
  region= "${var.aws_region}"
  
  aws_polling {
    delay_seconds = 120
    max_attempts  = 50
  }
  

  instance_type = "t2.micro"
  ssh_username  = "${var.ssh_username}"
  vpc_filter {
    filters = {
      "is-default" = "true"
    }
  }
  


  launch_block_device_mappings {
    delete_on_termination = true
    device_name           = "/dev/xvda"
    volume_size           = 50
    volume_type           = "gp2"
  }

   


  source_ami_filter {
    filters = {
      "virtualization-type" = "hvm"
       "name"                = "amzn2-ami-hvm-2.0.*-x86_64-ebs"
      "root-device-type"    = "ebs"
    }
    owners      = ["amazon"]
    most_recent = true
  }
  ami_users= ["${var.aws_account_id}"]
   tags= {
        "Name": "Assignment-ami"
      }



 
}

build {
  sources = [
    "source.amazon-ebs.my_ami"
  ]
  provisioner "file" {
    source      = "{{ `.` }}/project"
    destination = "/home/ec2-user/project"
  }
  provisioner "file" {
  source      = "{{ `.` }}/systemd.service"
  destination = "/home/ec2-user/project/systemd.service"
  }
  provisioner "shell" {
    script = "shell.sh"
  }
  provisioner "file" {
    source      = "{{ `.` }}/cloudWatchAgent.json"
    destination = "/home/ec2-user/project/cloudWatchAgent.json"
  }
    provisioner "shell" {
    script = "shell2.sh"
  }
   provisioner "shell" {
    script = "shell3.sh"
  }


}

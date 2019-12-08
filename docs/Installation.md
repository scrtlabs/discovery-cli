# Installation

## Step 1: Docker
If `docker` is not yet installed on your machine, follow these [instructions](https://docs.docker.com/install/) to add it. 

## Step 2: Docker Compose
If `docker-compose` is not yet installed on your machine, follow these [instructions](https://docs.docker.com/compose/install/) to install version 1.23.2 or higher. Please be aware that `docker-compose` introduced a bug in 1.23.0 (also present in 1.23.1) that appended random strings to container names that causes this network configuration to break. 

## Step 3: Git
If `git` is not yet installed on your machine, follow these [instructions](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) to add it. 

## Step 4: Rust
Enigma secret contract are written in Rust, thus Rust needs to be installed. A recommended guide can be found [here](https://doc.rust-lang.org/book/ch01-01-installation.html).  

## Step 5: NVM + Node
The `discovery-cli` npm package needs to be installed globally. It is recommended to use `nvm`. For more information please refer to [NVM Installation](https://github.com/nvm-sh/nvm). Once `nvm` is installed, use it in order to install `node`. The current `discovery-cli` version works with `node` releases 8.0 to 11.15. 

## Step 6: discovery-cli
Now that everything is set, go ahead and install the `discovery-cli` using the following command:
 
```
npm install -g @enigmampc/discovery-cli
```

# Troubleshooting

## Missing Python installation
Some of the `discovery-cli` dependencies require Python installation. 
If `python` is not yet installed on your machine, you should add it. 

## Missing docker group in Linux
```
Error: connect EACCES /var/run/docker.sock
```
Follow [these](https://docs.docker.com/install/linux/linux-postinstall/) instructions to create `docker` group and add your user.

# Example Ubuntu Install
This script automates steps 1-5 above and includes troubleshooting fixes. It was created for Ubuntu 18. 
```
#update environment
sudo apt-get update && sudo apt-get -y upgrade

sudo apt-get --assume-yes install \
   apt-transport-https \
   ca-certificates \
   curl \
   gnupg-agent \
   software-properties-common 

#docker install steps
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo apt-key fingerprint 0EBFCD88
sudo add-apt-repository \
  "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) \
  stable"
sudo apt-get update
sudo apt-get --assume-yes install docker-ce docker-ce-cli containerd.io
sudo docker run hello-world

#docker compose install steps
sudo curl -L "https://github.com/docker/compose/releases/download/1.25.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
docker-compose --version

#git install steps
sudo apt-get --assume-yes install git-all

#rust install steps
#Note: the following line was altered to avoid a prompt
curl -s https://sh.rustup.rs | bash /dev/stdin -y
source $HOME/.cargo/env

#nvm install steps
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.1/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
command -v nvm
nvm install 8

#additional missing code in base environment
sudo apt-get --assume-yes install python make build-essential

#fix problem with docker permissions
sudo usermod -aG docker $USER
```
Once finished run `newgrp docker` and proceed to step 6

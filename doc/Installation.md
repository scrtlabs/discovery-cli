# Installation
## Step 1: Docker
If `docker` is not yet installed on your machine, follow these [instructions](https://docs.docker.com/install/) to add it. 
## Step 2: Docker Compose
If `docker-compose` is not yet installed on your machine, follow these [instructions](https://docs.docker.com/compose/install/) to install version 1.23.2 or higher. 
Please be aware that `docker-compose` introduced a bug in 1.23.0 (also present in 1.23.1) that appended random strings to container names that causes this network configuration to break. 
## Step 3: GIT
If `git` is not yet installed on your machine, follow these [instructions](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) to add it. 
## Step 4: Rust
Enigma secret contract wre written in rust, thus Rust needs to be installed. A recommended guide can be found [here](https://doc.rust-lang.org/book/ch01-01-installation.html).  
## Step 5: NVM + NODE
The `discovery-cli` npm package needs to be installed globally. It is recommended to use `nvm`. For more information please refer to [this](https://github.com/nvm-sh/nvm).  
Once `nvm` is installed, use it in order to install `node`. The current `discovery-cli` version works with `node` releases 8.0 to 11.15. 
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

# Uninstall
```
npm remove -g @enigmampc/discovery-cli
```


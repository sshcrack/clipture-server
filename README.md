<img src="https://github.com/sshcrack/clipture/blob/master/src/assets/renderer/logo_text.svg?raw=true" width="300"></img>
## ☄ Record your favourite moments self-hosted! (Server)
This is the server only. 
## Installation
1. Install Node.js / npm
2. Install yarn
  ```bash
  npm i -g yarn
  ```
3. Set respository up
  ```bash
    git clone https://github.com/sshcrack/clipture-server
    cd clipture-server
    yarn
    yarn build
  ```
3.1 Install & start server for storage
```bash
git clone https://github.com/sschrack/clipture-storage
cd clipture-storage
yarn
yarn build:main
yarn start
```
4. Edit .env.local
5. Start Server
  ```bash
    yarn start
  ```

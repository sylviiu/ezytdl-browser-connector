# ezytdl-browser-connector
Browser extension that connects to the ezytdl app.

---

## Download

<a class="col-sm-1" href="https://addons.mozilla.org/en-US/firefox/addon/ezytdl-browser-connector/">
  <img src="https://img.shields.io/badge/DOWNLOAD-black?label=Firefox (soon)&style=for-the-badge&logo=firefox&logoColor=white&labelColor=black&color=black"/>
</a>

<a class="col-sm-1" href="https://chrome.google.com/webstore/detail/ezytdl-browser-connector/bnmombaecfkgkhcfbnmgmajlljnlgeaf">
  <img src="https://img.shields.io/badge/DOWNLOAD-black?label=Google Chrome&style=for-the-badge&logo=googlechrome&logoColor=white&labelColor=black&color=black"/>
</a>

<a class="col-sm-1" href="https://github.com/sylviiu/ezytdl-browser-connector/releases/latest">
  <img src="https://img.shields.io/badge/DOWNLOAD-black?label=Zip Builds&style=for-the-badge&&logo=github&logoColor=white&labelColor=black&color=black"/>
</a>

---

## How it works

The browser extension is designed with security in mind. I'm no security expert, but I did my best.

The main application generates a public/private key pair (and a fingerprint from the private key), which then is stored in the extension to use with that fingerprint every time. Data sent between the extension and app will ALWAYS be encrypted, and if another server is started under the same port, data cannot be decrypted without the private key.

--

#### obligatory note

by using this program (ezytdl), you assume all responsibility for the use of it, including (but not limited to) any legal issues that may arise from it. the author of this program is not responsible for any damages caused by the use of this program.

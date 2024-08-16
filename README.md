# <img src="https://github.com/JoSimon05/QuickAuth/blob/Latest/icons/logo.ico" width="32"/> QuickAuth

[![release](https://img.shields.io/badge/dynamic/json?url=https://github.com/JoSimon05/QuickAuth/blob/Latest/package.json&query=version&style=flat-square&label=Latest&labelColor=30363d&color=2ea043)](https://github.com/JoSimon05/QuickAuth/releases) 
![framework](https://img.shields.io/badge/Framework-Electron-47848F?style=flat-square&labelColor=30363d)
![platform](https://img.shields.io/badge/Platform-Windows-0078d4?style=flat-square&labelColor=30363d)

<br>

> **A minimal 2FA Authenticator that generate OTPs to easily access your accounts**

![app1](https://github.com/JoSimon05/QuickAuth/blob/Latest/.github/app1.png)
![app2](https://github.com/JoSimon05/QuickAuth/blob/Latest/.github/app2.png)
![app3](https://github.com/JoSimon05/QuickAuth/blob/Latest/.github/app3.png)
![app4](https://github.com/JoSimon05/QuickAuth/blob/Latest/.github/app4.png)

<!-- ## DEMO -->

## WHAT IS 2FA?
<ins>**Two-Factor Authentication**</ins> (2FA) is a strong <ins>**security method**</ins> that requires two distinct forms of identification to access a websites (for example) and you can enable it in "Privacy and Security" section of your accounts. <br>
Usually, websites you want to access send you a <ins>**6-digit code**</ins> via email or phone messages, but they often give you the opportunity to increase your account security level by enabling 2FA, using a <ins>**third-party app**</ins> (like **QuickAuth**) which generates a <ins>**new code every 30s**</ins> for each stored account.

> The "code" is called One Time Password (OTP) or Token in technical jargon

2FA apps require a <ins>**secret-key**</ins> to generate OTP and every website provides you with one in the form of a <ins>**QR code**</ins> or a <ins>**string**</ins> of letters and numbers.

> [!NOTE]
> **QuickAuth** can only accept secret-keys in string form (QR code scanner feature is under development...)

<br>

## LOCAL STORAGE
All account secret-keys are stored inside a local database, sorted alphabetically (by name) and reloaded on application startup.

```json
"accounts": [
    {
        "name": "Discord",
        "key": "YOURDISCORDSECRETKEY"
    },
    {
        "name": "Epic Games",
        "key": "YOUREPICGAMESSECRETKEY"
    },
    {
        "name": "Github",
        "key": "YOURGITHUBSECRETKEY"
    }
]
```

<br>

## UPDATES
Updates are automatically checked and downloaded on startup, then you can choose wheter to install them immediately or at the next startup.

> [!NOTE]
> Even if you install new versions of the application, you won't lose your [stored data](https://github.com/JoSimon05/QuickAuth?tab=readme-ov-file#local-saves)

<br>

## USER-FRIENDLY
...

<br>

# Try QuickAuth!
**Check [Releases section](https://github.com/JoSimon05/QuickAuth/releases) and download the latest version available.**

> You just need to download this file:&nbsp; **QuickAuth_{version}_setup.exe**

> [!WARNING]
> Before installation by *installer.exe*, the system antivirus could show a security alert. DON'T WORRY! \
> You just need to click on "**More info**"
> 
> ![alert1](https://github.com/JoSimon05/POST-IT/blob/Latest/.github/installation1.png)
> 
> finally, click on the button "**Run anyway**" that appears next.
> 
> ![alert2](https://github.com/JoSimon05/POST-IT/blob/Latest/.github/installation2.png)
>
> > That's because *authentication certificate* for native applications is missing yet (It's not that cheap...)


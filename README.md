# <img src="https://github.com/JoSimon05/QuickAuth/blob/Latest/icons/logo.ico" width="32"/> QuickAuth

[![release](https://img.shields.io/badge/dynamic/json?url=https://github.com/JoSimon05/QuickAuth/blob/Latest/package.json&query=version&style=flat-square&label=Latest&labelColor=30363d&color=2ea043)](https://github.com/JoSimon05/QuickAuth/releases) 
![framework](https://img.shields.io/badge/Framework-Electron-47848F?style=flat-square&labelColor=30363d)
![platform](https://img.shields.io/badge/Platform-Windows-0078d4?style=flat-square&labelColor=30363d)

<br>

> **A minimal 2FA Authenticator that generate OTPs to easily access your accounts**

!
!
!
!

<br>

## DEMO

!

<br>

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



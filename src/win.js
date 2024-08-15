
const { clipboard, ipcRenderer } = require("electron")
const speakeasy = require("speakeasy")

document.addEventListener("DOMContentLoaded", () => {

    const message = document.getElementById("message")
    const closeButton = document.getElementById("close-button")

    const inputView = document.getElementById("input-view")
    const accountView = document.getElementById("account-view")

    const nameInput = document.getElementById("name-input")
    const keyInput = document.getElementById("key-input")
    const cancelButton = document.getElementById("cancel-button")
    const doneButton = document.getElementById("done-button")
    const inputAlert = document.getElementById("input-alert")

    const accountSelect = document.getElementById("account-select")
    const addButton = document.getElementById("add-button")
    const deleteButton = document.getElementById("delete-button")

    const deleteBar = document.getElementById("delete-bar")
    const code = document.getElementById("code")

    let isCode
    let selectedOption
    let isMouseOver
    let isPressed
    let timeoutID


    // close button events
    closeButton.addEventListener("click", () => ipcRenderer.send("quit")) // IPC: send "quit" event


    // add button events
    addButton.addEventListener("click", () => {
        
        // switch view
        inputView.style.display = "block"
        accountView.style.display = "none"

        nameInput.focus()
    })

    // cancel button events
    cancelButton.addEventListener("click", () => {

        // switch view
        inputView.style.display = "none"
        accountView.style.display = "block"

        // clear inputs
        nameInput.value = ""
        keyInput.value = ""
    })


    // done button and inputs events
    doneButton.addEventListener("click", () => checkInput())

    nameInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") checkInput()
    })

    keyInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") checkInput()
    })


    // account select events
    accountSelect.addEventListener("mouseenter", () => {
        message.innerText = "Select Account..."
    })

    accountSelect.addEventListener("mouseleave", () => {
        message.innerText = ""
    })

    accountSelect.addEventListener("change", () => {
        code.innerText = generateTOTP(accountSelect.value)
        message.innerText = ""

        ipcRenderer.send("saveSelectedOption", accountSelect.value)
    })


    // add button events
    addButton.addEventListener("mouseenter", () => {
        message.innerText = "Add..."
    })

    addButton.addEventListener("mouseleave", () => {
        message.innerText = ""
    })

    addButton.addEventListener("mousedown", () => {
        message.innerText = ""

        deleteBar.style.transition = "none"
        deleteBar.style.width = "0"

        isMouseOver = false
    })


    // delete button events
    deleteButton.addEventListener("mouseenter", () => {
        message.innerText = "Delete..."
        isMouseOver = true
    })

    deleteButton.addEventListener("mouseleave", () => {
        message.innerText = ""

        deleteBar.style.transition = "none"
        deleteBar.style.width = "0"

        isMouseOver = false
    })

    deleteButton.addEventListener("mousedown", () => {

        if (accountSelect.options.length > 0) {

            message.innerText = "Deleting..."

            deleteBar.style.transition = "width linear 1s"
            deleteBar.style.width = "100%"

            isPressed = true

            if (timeoutID) clearTimeout(timeoutID)

            timeoutID = setTimeout(() => {

                if (isPressed && isMouseOver) {

                    ipcRenderer.send("removeAccount", accountSelect.value) // IPC: send "removeAccount" event

                    // remove account option
                    const options = Array.from(accountSelect.querySelectorAll("option"))
                    options.find(o => o.value === accountSelect.value).remove()

                    deleteBar.style.transition = "none"
                    deleteBar.style.width = "0"

                    message.innerText = "Delete..."

                    code.innerText = generateTOTP(accountSelect.value) // generate new code

                    ipcRenderer.send("saveSelectedOption", accountSelect.value) // IPC: send "saveSelectedOption" event
                }

            }, 1000);
        }
    })

    deleteButton.addEventListener("mouseup", () => {
        message.innerText = "Delete..."

        deleteBar.style.transition = "none"
        deleteBar.style.width = "0"

        isPressed = false
    })


    // code text event
    code.addEventListener("click", () => {

        if (isCode) {
            clipboard.writeText(code.textContent) // copy code
            message.innerText = "Copied!"

            // overwrite current timeout
            if (timeoutID) clearTimeout(timeoutID)

            timeoutID = setTimeout(() => {

                if (
                    message.innerText == "Copy..." ||
                    message.innerText == "Add..." ||
                    message.innerText == "Select Account..." ||
                    message.innerText == "Delete..."
                ) {
                    clearTimeout(timeoutID)

                } else message.innerText = ""

            }, 3000)
        }
    })

    code.addEventListener("mouseenter", () => {

        if (isCode) {
            code.style.color = "#888"
            message.innerText = "Copy..."
        }
    })

    code.addEventListener("mouseleave", () => {

        if (isCode) {
            code.style.color = "#000"

            if (message.innerText == "Copy..." || message.innerText == "") {
                message.innerText = ""

            } else {
                message.innerText = "Copied!"

                // overwrite current timeout
                if (timeoutID) clearTimeout(timeoutID)

                timeoutID = setTimeout(() => {

                    if (
                        message.innerText == "Copy..." ||
                        message.innerText == "Add..." ||
                        message.innerText == "Select Account..." ||
                        message.innerText == "Delete..."
                    ) {
                        clearTimeout(timeoutID)

                    } else message.innerText = ""

                }, 3000)
            }
        }
    })

    code.addEventListener("mousedown", () => {

        if (isCode) {
            code.style.color = "#000"
            message.innerText = ""
        }
    })


    // IPC: sort accounts alphabetically
    ipcRenderer.on("sortList", (e, data) => {

        accountSelect.innerHTML = "" // remove all options

        // recreate options
        data.accounts.forEach(a => {

            const newOption = document.createElement("option")

            newOption.text = a.name
            newOption.value = a.key

            accountSelect.appendChild(newOption)
        })

        // select last option
        const options = Array.from(accountSelect.querySelectorAll("option"))

        if (data.startup) {
            options.find(o => o.value === data.selected).selected = true

        } else {
            options.find(o => o.value === selectedOption).selected = true
        }

        // generate code every 30s
        code.innerText = generateTOTP(accountSelect.value)

        setInterval(() => {
            code.innerText = generateTOTP(accountSelect.value)
        }, 500);

        // switch view
        inputView.style.display = "none"
        accountView.style.display = "block"

        // clear inputs
        nameInput.value = ""
        keyInput.value = ""

        // IPC: send "saveSelectedOption" event
        ipcRenderer.send("saveSelectedOption", accountSelect.value)
    })


    // FUNCTION: check if input already exists
    function checkInput() {

        if (/^\s*$/.test(nameInput.value)) nameInput.value = "" // prevent empty names

        keyInput.value = keyInput.value.replace(/\s/g, "") // remove white spaces

        if (nameInput.value == "") {
            return nameInput.focus()
        }

        if (keyInput.value == "") {
            return keyInput.focus()
        }

        const accounts = accountSelect.querySelectorAll("option")

        let doesExists = false

        for (let i = 0; i < accounts.length; i++) {

            if (nameInput.value == accounts[i].text) {
                doesExists = true
                showAlert("Name already in use!")
                break
            }

            if (keyInput.value == accounts[i].value) {
                doesExists = true
                showAlert("Key already in use!")
                break
            }
        }

        if (!doesExists) {
            setAccount(nameInput.value, keyInput.value)
        }
    }

    // FUNCTION: set new account option
    function setAccount(name, key) {

        const newOption = document.createElement("option")

        newOption.text = name
        newOption.value = key

        accountSelect.appendChild(newOption)
        selectedOption = key

        code.innerText = generateTOTP(accountSelect.value) // generate new code

        // IPC: send "setAccount" event
        ipcRenderer.send("setAccount", { name: nameInput.value, key: keyInput.value })
    }

    // FUNCTION: show alert if already exists
    function showAlert(alert) {

        inputAlert.innerText = alert

        cancelButton.style.display = "none"
        doneButton.style.display = "none"
        inputAlert.style.display = "block"

        setTimeout(() => {
            cancelButton.style.display = "block"
            doneButton.style.display = "block"
            inputAlert.style.display = "none"

            inputAlert.innerText = ""

        }, 1500);
    }

    // FUNCTION: generate 30s timed otp
    function generateTOTP(setupKey) {
        
        if (setupKey != "") {
            isCode = true

            // generate code
            const code = speakeasy.totp({
                secret: setupKey,
                encoding: "base32",
                digits: 6,
                step: 30
            })

            // verify code
            const isValid = speakeasy.totp.verify({
                encoding: "base32",
                secret: setupKey,
                token: code,
            })

            if (!isValid) {
                generateTOTP() // repeat if invalid

            } else return code


        } else {
            isCode = false
            return ""
        }
    }
})

// FUNCTION: log info
function log(text) {
    ipcRenderer.send("log", text) // IPC: send "log" event
}
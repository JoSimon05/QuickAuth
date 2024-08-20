
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
    const accountList = document.getElementById("account-list")
    const addButton = document.getElementById("add-button")
    const deleteButton = document.getElementById("delete-button")

    const deleteBar = document.getElementById("delete-bar")
    const code = document.getElementById("code")

    let isSelectOpen
    let isMouseOver
    let isPressed
    let isCode
    let timeoutID

    let isKeyDown = false


    // close button events
    closeButton.addEventListener("click", () => ipcRenderer.send("quit")) // IPC: send "quit" event


    // cancel/done buttons and inputs events
    cancelButton.addEventListener("click", () => {

        // switch view to account
        inputView.style.display = "none"
        accountView.style.display = "block"

        // clear inputs
        nameInput.value = ""
        keyInput.value = ""
    })

    document.addEventListener("keydown", (e) => {

        if (e.key === "Escape") {

            // switch view to account
            inputView.style.display = "none"
            accountView.style.display = "block"

            // clear inputs
            nameInput.value = ""
            keyInput.value = ""
        }
    })

    doneButton.addEventListener("click", () => checkInput())

    nameInput.addEventListener("keydown", (e) => {

        if (e.key === "Enter") checkInput()
    })

    keyInput.addEventListener("keydown", (e) => {

        if (e.key === "Enter") checkInput()
    })


    // account select events
    accountSelect.addEventListener("mouseenter", () => {

        const options = accountList.querySelectorAll(".account-option")

        message.innerText = options.length > 0 ? "Select Account..." : "Add..."
    })

    accountSelect.addEventListener("mouseleave", () => {
        message.innerText = ""
    })

    accountSelect.addEventListener("focus", () => {

        const options = accountList.querySelectorAll(".account-option")

        message.innerText = options.length > 0 ? "Select Account..." : "Add..."
    })

    accountSelect.addEventListener("blur", () => {
        message.innerText = ""
    })

    accountSelect.addEventListener("click", () => {

        const options = Array.from(accountList.querySelectorAll(".account-option"))

        if (options.length > 0) {

            // show account list
            addButton.tabIndex = "-1"
            accountSelect.tabIndex = "-1"
            deleteButton.tabIndex = "-1"

            accountList.style.display = "block"
            isSelectOpen = true

            // focus selected option
            options.find(option => option.value === accountSelect.value).focus()

        } else {

            // switch view to input
            inputView.style.display = "block"
            accountView.style.display = "none"

            nameInput.focus()
        }
    })

    // focus account select first
    setTimeout(() => {

        const options = accountList.querySelectorAll(".account-option")

        if (options.length > 0) accountSelect.focus()

    }, 50);


    // account list events (wheel and arrows)
    document.addEventListener("keydown", (e) => {

        // select previous option
        if (isSelectOpen && e.key === "ArrowUp") {
            e.preventDefault()

            accountList.scrollTop -= 23
            document.activeElement.previousSibling.focus({ preventScroll: true })
        }

        // select next option
        if (isSelectOpen && e.key === "ArrowDown") {
            e.preventDefault()

            accountList.scrollTop += 23
            document.activeElement.nextSibling.focus({ preventScroll: true })
        }

        if (isSelectOpen && e.key === "Tab") e.preventDefault() // prevent Tab select
    })

    accountList.addEventListener("wheel", (e) => {

        if (isSelectOpen) {
            e.preventDefault()

            // wheel up
            if (e.deltaY < 0) {
                accountList.scrollTop -= 23
            }

            // wheel down
            if (e.deltaY > 0) {
                accountList.scrollTop += 23
            }
        }
    })

    document.addEventListener("click", (e) => {

        if (isSelectOpen && e.target != (accountSelect || accountList) && e.target.className != "account-option") {
            accountList.style.display = "none"
            isSelectOpen = false

            addButton.tabIndex = "0"
            accountSelect.tabIndex = "0"
            deleteButton.tabIndex = "0"
        }
    })


    // add button events
    addButton.addEventListener("mouseenter", () => {

        if (!isSelectOpen) {
            message.innerText = "Add..."
            addButton.style.backgroundColor = "#ccc"
        }
    })

    addButton.addEventListener("mouseleave", () => {

        if (!isSelectOpen) {
            message.innerText = ""
            addButton.style.backgroundColor = "#eee"
        }
    })

    addButton.addEventListener("focus", () => {

        if (!isSelectOpen) {
            message.innerText = "Add..."
            addButton.style.backgroundColor = "#ccc"
        }
    })

    addButton.addEventListener("blur", () => {

        if (!isSelectOpen) {
            message.innerText = ""
            addButton.style.backgroundColor = "#eee"
        }
    })

    addButton.addEventListener("click", () => {

        if (!isSelectOpen) {

            // switch view to input
            inputView.style.display = "block"
            accountView.style.display = "none"

            nameInput.focus()
        }
    })


    // delete button events
    deleteButton.addEventListener("mouseenter", () => {

        if (!isSelectOpen) {
            message.innerText = "Delete..."

            deleteButton.style.backgroundColor = "red"

            isMouseOver = true
        }
    })

    deleteButton.addEventListener("mouseleave", () => {

        if (!isSelectOpen && document.activeElement !== deleteButton) {
            message.innerText = ""

            deleteButton.style.backgroundColor = "#eee"
            deleteBar.style.transition = "none"
            deleteBar.style.width = "0"

            isMouseOver = false
        }
    })

    deleteButton.addEventListener("mousedown", () => {

        if (!isSelectOpen) {
            deleteAccount()
        }
    })

    deleteButton.addEventListener("mouseup", () => {

        if (!isSelectOpen) {
            message.innerText = "Delete..."

            deleteBar.style.transition = "none"
            deleteBar.style.width = "0"

            isPressed = false
        }
    })

    deleteButton.addEventListener("focus", () => {

        if (!isSelectOpen) {
            message.innerText = isPressed ? "Deleting..." : "Delete..."

            deleteButton.style.backgroundColor = "red"

            isMouseOver = true
        }
    })

    deleteButton.addEventListener("blur", () => {

        if (!isSelectOpen) {
            message.innerText = ""

            deleteButton.style.backgroundColor = "#eee"
            deleteBar.style.transition = "none"
            deleteBar.style.width = "0"

            isMouseOver = false
        }
    })

    document.addEventListener("keydown", (e) => {

        if (!isKeyDown) {
            isKeyDown = true

            if (!isSelectOpen && document.activeElement === deleteButton && (e.key === "Enter" || e.key == " ")) {
                deleteAccount()
            }
        }
    })

    document.addEventListener("keyup", (e) => {
        isKeyDown = false

        if (!isSelectOpen && document.activeElement === deleteButton && (e.key === "Enter" || e.key == " ")) {
            message.innerText = "Delete..."

            deleteBar.style.transition = "none"
            deleteBar.style.width = "0"

            isPressed = false
        }
    })


    // code text event
    code.addEventListener("click", () => {

        if (!isSelectOpen && isCode) {
            clipboard.writeText(code.textContent) // copy code
            message.innerText = "Copied!"

            // overwrite current timeout
            if (timeoutID) clearTimeout(timeoutID)

            timeoutID = setTimeout(() => {

                if (message.innerText == "Copy..." || message.innerText == "Add..." || message.innerText == "Select Account..." || message.innerText == "Delete...") {
                    clearTimeout(timeoutID)

                } else message.innerText = ""

            }, 3000)
        }
    })

    code.addEventListener("mouseenter", () => {

        if (!isSelectOpen && isCode) {
            code.style.color = "#888"
            message.innerText = "Copy..."
        }
    })

    code.addEventListener("mouseleave", () => {

        if (!isSelectOpen && isCode) {
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

        if (!isSelectOpen && isCode) {
            code.style.color = "#000"
            message.innerText = ""
        }
    })


    // check for new code every 500ms
    setInterval(() => {
        code.innerText = generateTOTP(accountSelect.value)
    }, 500);


    // IPC: sort accounts alphabetically
    ipcRenderer.on("sortList", (e, data) => {

        accountList.innerHTML = "" // remove all options

        // recreate options
        data.accounts.forEach(account => {

            const newOption = document.createElement("button")

            newOption.className = "account-option"
            newOption.textContent = account.name
            newOption.value = account.key

            optionEvents(newOption)

            accountList.appendChild(newOption)
        })

        // select last option
        const options = Array.from(accountList.querySelectorAll(".account-option"))

        if (data.startup) {

            const option = options.find(option => option.value === data.selected)

            accountSelect.textContent = option.textContent
            accountSelect.value = option.value
        }

        // generate new code
        code.innerText = generateTOTP(accountSelect.value)

        // switch view to account
        inputView.style.display = "none"
        accountView.style.display = "block"

        // clear inputs
        nameInput.value = ""
        keyInput.value = ""
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

        const accounts = accountList.querySelectorAll(".account-option")

        let doesExists = false

        for (let i = 0; i < accounts.length; i++) {

            if (nameInput.value == accounts[i].textContent) {
                doesExists = true
                showAlert("Name already in use!", "name")
                break
            }

            if (keyInput.value == accounts[i].value) {
                doesExists = true
                showAlert("Key already in use!", "key")
                break
            }
        }

        if (!doesExists) {
            setAccount(nameInput.value, keyInput.value)
        }
    }

    // FUNCTION: set new account option
    function setAccount(name, key) {

        const newOption = document.createElement("button")

        newOption.className = "account-option"
        newOption.textContent = name
        newOption.value = key

        optionEvents(newOption)

        accountList.appendChild(newOption)

        accountSelect.textContent = name
        accountSelect.value = key

        code.innerText = generateTOTP(accountSelect.value) // generate new code

        // IPC: send "setAccount" and "saveSelectedOption" events
        ipcRenderer.send("setAccount", { name: nameInput.value, key: keyInput.value })
        ipcRenderer.send("saveSelectedOption", accountSelect.value)
    }

    // FUNCTION: show alert if parameters already exist
    function showAlert(alert, input) {

        inputAlert.innerText = alert

        cancelButton.style.display = "none"
        doneButton.style.display = "none"
        inputAlert.style.display = "block"

        nameInput.disabled = true
        keyInput.disabled = true

        setTimeout(() => {

            cancelButton.style.display = "block"
            doneButton.style.display = "block"
            inputAlert.style.display = "none"

            inputAlert.innerText = ""

            nameInput.disabled = false
            keyInput.disabled = false

            if (input == "name") nameInput.focus()
            if (input == "key") keyInput.focus()

        }, 1000);
    }

    // FUNCTION: set events to new account options
    function optionEvents(element) {

        // account options events
        element.addEventListener("mouseenter", () => {
            element.focus({ preventScroll: true })
        })

        element.addEventListener("click", () => {

            accountSelect.textContent = element.textContent
            accountSelect.value = element.value

            accountList.style.display = "none"
            isSelectOpen = false

            addButton.tabIndex = "0"
            accountSelect.tabIndex = "0"
            deleteButton.tabIndex = "0"

            code.innerText = generateTOTP(accountSelect.value) // generate new code

            // IPC: send "saveSelectedOption" event
            ipcRenderer.send("saveSelectedOption", accountSelect.value)
        })
    }

    function deleteAccount() {

        const options = Array.from(accountList.querySelectorAll(".account-option"))

        if (options.length > 0) {
            message.innerText = "Deleting..."

            deleteBar.style.transition = "width linear 1s"
            deleteBar.style.width = "100%"

            isPressed = true

            if (timeoutID) clearTimeout(timeoutID)

            timeoutID = setTimeout(() => {

                if (isPressed && isMouseOver) {

                    ipcRenderer.send("removeAccount", accountSelect.value) // IPC: send "removeAccount" event

                    const optionToDelete = options.find(option => option.value === accountSelect.value)

                    // update account select
                    if (options.length > 1) {
                        accountSelect.textContent = optionToDelete.previousSibling ? optionToDelete.previousSibling.textContent : optionToDelete.nextSibling.textContent
                        accountSelect.value = optionToDelete.previousSibling ? optionToDelete.previousSibling.value : optionToDelete.nextSibling.value

                    } else {
                        accountSelect.textContent = ""
                        accountSelect.value = ""
                    }

                    optionToDelete.remove() // remove account option

                    deleteBar.style.width = "0"
                    deleteBar.style.transition = "none"

                    message.innerText = "Delete..."

                    deleteButton.blur()

                    code.innerText = generateTOTP(accountSelect.value) // generate new code

                    ipcRenderer.send("saveSelectedOption", accountSelect.value) // IPC: send "saveSelectedOption" event
                }

            }, 1000);
        }
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
                return generateTOTP() // repeat if invalid

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
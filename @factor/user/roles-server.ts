import { addFilter, setting } from "@factor/tools"
import { writeConfig } from "@factor/cli/setup"

function userRoles() {
  return require("./roles.json")
}

addFilter("user-schema", (_) => {
  _.role = {
    type: String,
    enum: Object.keys(userRoles()),
    required: true,
    default: "member"
  }

  _.accessLevel = {
    type: Number,
    min: 0,
    max: 1000,
    required: true,
    default: 0,
    index: true
  }

  return _
})

// Add role property to user schema
// Create a virtual accessLevel property based on role
addFilter("user-schema-hooks", (Schema) => {
  Schema.pre("validate", async function(next) {
    const existing = setting(`roles.${this.email}`)
    const configRole = this.emailVerified && existing ? existing : "member"

    if (configRole != this.role) {
      this.role = configRole
    } else if (this.isModified("role") && configRole != this.role) {
      return next(new Error(`Can not edit role ${this.role}`))
    }

    this.accessLevel = userRoles()[this.role] || 0

    return next()
  })
})

// CLI admin setup utility
addFilter("cli-add-setup", (_) => {
  const setupAdmins = {
    name: "User Roles - Add admin privileges to specific users.",
    value: "admins",
    callback: async ({ inquirer }) => {
      const roles = userRoles()
      const choices = Object.keys(roles).map((_) => {
        return {
          name: `${_} (${roles[_]})`,
          value: _
        }
      })

      const questions = [
        {
          name: "email",
          message: "What's the user's email?",
          type: "input",
          validate: (v) => {
            const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            return re.test(v) ? true : "Enter a valid email address"
          }
        },
        {
          name: "role",
          message: "What is the role for this admin?",
          choices,
          type: "list"
        },
        {
          type: "confirm",
          name: `askAgain`,
          message: `Got it. Add another user?`,
          default: false
        }
      ]

      const admins = {}
      const ask = async () => {
        const { askAgain, email, role } = await inquirer.prompt(questions)
        admins[email] = role
        if (askAgain) await ask()
      }

      await ask()

      await writeConfig("factor-config", { roles: admins })
    }
  }

  return [..._, setupAdmins]
})
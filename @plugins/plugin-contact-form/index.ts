import { requestPostSave } from "@factor/post/request"
import { toLabel, addPostType, setting } from "@factor/api"
import { sendEmailRequest } from "@factor/email"
import { Component } from "vue"
const postType = "contact-form"

export const sendFormEmail = async (form: object): Promise<void> => {
  const toSetting = setting("contactForm.email")
  const to = typeof toSetting == "function" ? toSetting() : toSetting

  const text = Object.entries(form)
    .map(([key, value]) => `<p><strong>${toLabel(key)}</strong><br><i>${value}</i></p>`)
    .join("")

  await sendEmailRequest("sendTransactional", {
    _id: "contact-form",
    to,
    subject: "Contact Form Submitted",
    text
  })

  return
}

export const saveContactForm = async (form: object): Promise<object> => {
  const post = { settings: form }
  const saved = await requestPostSave({ post, postType: postType })
  sendFormEmail(form)
  return saved
}

export const setup = (): void => {
  addPostType({
    postType: postType,
    nameIndex: "Contact Form Submissions",
    nameSingle: "Submission",
    namePlural: "Contact Form Submissions",
    listTemplate: (): Promise<Component> => import("./dashboard-list.vue"),
    noAddNew: true
  })
}
setup()

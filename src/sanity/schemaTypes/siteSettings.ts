import { defineArrayMember, defineField, defineType } from "sanity";

export const siteSettingsType = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  fields: [
    defineField({
      name: "logo",
      title: "Logo",
      type: "image",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "navigation",
      title: "Navigation",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "label",
              title: "Label",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "href",
              title: "Link",
              type: "string",
              validation: (rule) => rule.required(),
            }),
          ],
        }),
      ],
    }),
    defineField({ name: "phone", title: "Phone", type: "string" }),
    defineField({ name: "whatsapp", title: "WhatsApp", type: "string" }),
    defineField({ name: "address", title: "Address", type: "text", rows: 2 }),
    defineField({ name: "hours", title: "Hours", type: "string" }),
    defineField({ name: "mapUrl", title: "Map link", type: "url" }),
    defineField({
      name: "googleBusinessUrl",
      title: "Google Business Profile",
      type: "url",
    }),
    defineField({ name: "androidUrl", title: "Android app", type: "url" }),
    defineField({ name: "iosUrl", title: "iOS app", type: "url" }),
    defineField({
      name: "sisterBrandUrl",
      title: "DDAJewels link",
      type: "url",
    }),
    defineField({
      name: "seoDescription",
      title: "Default SEO description",
      type: "text",
      rows: 3,
      validation: (rule) => rule.max(170),
    }),
  ],
  preview: {
    prepare: () => ({ title: "DDA Silver settings" }),
  },
});

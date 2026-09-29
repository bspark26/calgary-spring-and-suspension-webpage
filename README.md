# Calgary Spring and Suspension — website draft

This is a multi-page website draft designed for Cloudflare Pages. The `public` folder contains the homepage, service overview, six service pages, About, Contact, shared styles and scripts, and copies of the photos and logos used on the current website. The `functions` folder contains the contact-form handler.

The heading font, Barlow Condensed, is bundled locally. Its Open Font License is in `public/assets/fonts/OFL.txt`.

## Contact form setup

The form stays on the website and is designed to send inquiries to `calgaryspring@gmail.com` through Cloudflare Email Service. It shows a success message only after the email API accepts the submission, and an error with the shop phone number if delivery fails. The local static preview shows the form but cannot deliver messages.

To activate delivery in the business's Cloudflare account:

1. Add the domain to Cloudflare DNS. In **Email Service → Email Sending**, onboard `calgaryspringandsuspension.com` as a sender domain. The form sends from `website@calgaryspringandsuspension.com`.
2. In **Email Routing → Destination Addresses**, add `calgaryspring@gmail.com` and have the shop owner click the verification link Cloudflare sends there.
3. Create a Cloudflare API token with **Email Sending: Edit** permission. In the Pages project's **Variables and Secrets**, add `CLOUDFLARE_ACCOUNT_ID` and `EMAIL_API_TOKEN` as secrets. Never put either value in a website file.
4. Deploy from this folder using Wrangler or Git integration so Pages compiles the `functions` directory. Dashboard drag-and-drop upload of `public` alone will leave the form inactive.
5. Send a real test inquiry from the deployed site and confirm it arrives in Gmail, including the visitor's reply address. Then test an invalid form and the error state.

## Before going live

- Have the business owner confirm all service descriptions, hours, address, phone number, and testimonials.
- Contact-form delivery cannot be verified until the Cloudflare account, sender domain, destination verification, and API token are connected. Do this before pointing the business domain at the new site.
- Test old URLs and redirects on the selected host before changing the domain. The `_redirects` file covers the current page addresses for Cloudflare Pages, but the encoded slash in the old suspension URL needs particular attention.
- Confirm the shop has rights to continue using every image and logo from its current site. The images are bundled locally, so the design does not depend on GoDaddy's image URLs.
- Keep the GoDaddy domain active. Only cancel a website-builder subscription after the new site and contact path have been tested on the real domain.

The site has not been published or connected to the business domain.

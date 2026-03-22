# nep

This is a browser extension in development, aiming to make the use of the new (Angular-based) Neptun system more pleasant.

## Installation

### From official addon stores

*coming soon*

### Temporary (for testing)

1. Download the latest unsigned extension file from the [releases](https://github.com/neptun-extension-project/nep/releases) or from the [artifacts](https://github.com/neptun-extension-project/nep/actions). In the latter case, extract the outer zip file.
2. Install it in your favorite browser:

   Firefox: On the `about:addons` page: gear icon > Debug Add-ons > Load Temporary Add-on…

   Chrome: On the `chrome://extensions` page: Load unpacked

### For development

Use the `web-ext` tool to run the extension.

```bash
web-ext run -v -u https://neptun.bme.hu/hallgatoi/login
```

## Note about the old Neptun

This webextension was originally made for the old Neptun web interface. However, a much more user-friendly (UI/UX-wise) interface has since appeared. In light of this, I decided to switch to modding the new Neptun.

## Compatibility

The extension is compatible with Firefox, Chrome, and browsers based on them.

## Working features

All features can be toggled individually in the extension settings.

### Custom display name/Neptun code

Allows you to customize the label in the top right corner that contains your name and Neptun code.

Both the name and the Neptun code can be changed to custom values.

### Server selector

Some universities balance the load by running multiple Neptun servers at different addresses. This module simplifies switching between them and can also indicate how many free slots are available on each server.

### Anti-logout protection

Simulates activty to keep you from being logged out after 10 minutes.

### Cookie accepter

A simple module that automatically accepts the cookies used by Neptun.

### Gradebook menu item

Adds a menu item under "Studies" that leads to the transcript (previously called gradebook).

It would be nice to automatically select the transcript for the current semester in the future.

### Captcha solver

If the captcha window appears, it automatically fills it in and continues the login process.

It uses the audio captcha, requiring minimal resources. The original code was written by [RED](https://github.com/LetsUpdate) for [CSN](https://github.com/LetsUpdate/CSN), and has now been adapted for the new Neptun with minor modifications.

### Swagger UI

Helps developers test the Neptun API.

Adds a button to the footer that injects Swagger UI into the page. On this UI, it automatically selects the current Neptun server and fills in the access token from session storage.

## Planned features

### Dark theme

*in development*

The name is self-explanatory. Some UI elements had to be slightly modified for the implementation.

### Kitty-mode

*in development*

Cats walk around in the header (inspired by Google Colab).

### Custom theme

*TODO*

*May be merged with the dark theme.*

### Accessibility improvements

*TODO*

### Query optimization

*TODO*

### Self-care tips/happy thoughts

*TODO*

### Warning for unfilled questionnaires

*TODO*

### University-specific features

*TODO*

### NPU ports

I aim to port the NPU features, but some have become obsolete over time.

## Acknowledgements

[NPU](https://github.com/solymosi/npu) by [Máté Solymosi](https://github.com/solymosi)

[CSN](https://github.com/LetsUpdate/CSN) by [RED](https://github.com/LetsUpdate)

[selfcare.tech](https://github.com/jenniferlynparsons/selfcaretech)

## License

This project is distributed under the [GNU General Public License Version 3 (GPLv3)](https://www.gnu.org/licenses/gpl-3.0.html).

This project contains code from the following sources:

- Userscript by RED, available under the MIT license. The related copyright notice and license terms can be found in the source code.
- [js-yaml](https://github.com/nodeca/js-yaml), developed by Vitaly Puzrin: MIT license
- [swagger-ui](https://github.com/swagger-api/swagger-ui), by SmartBear Software: Apache License 2.0


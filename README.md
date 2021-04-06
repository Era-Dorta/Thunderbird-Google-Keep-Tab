# Google Keep Tab
Unofficial Google Keep add-on for Thunderbird, it adds a button that opens a Google Keep tab in Thunderbird.
The [home page](https://addons.thunderbird.net/thunderbird/addon/google-keep-tab) of the extension contains some pictures and reviews.

#### Installing 
Open Thunderbird, go to Tools -> Add-ons -> Extensions, search for Google Keep in the serach box and click on "+ Add to Thunderbird".

#### Installing from sources
Download the repository, zip it, rename it to Google-Keep-Tab.xpi and choose install addon from file in Thunderbird.

In linux the xpi file can be created with the following commands
* `git clone https://github.com/Garoe/Thunderbird-Google-Keep-Tab`
* `cd ./Thunderbird-Google-Keep-Tab`
* `VERSION=$(cat ./manifest.json | jq --raw-output '.version')`
* `zip -r "../Google-Keep-Tab-${VERSION}-tb.xpi" *`

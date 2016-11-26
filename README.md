# ThunderKeepPlus
Google Keep for Thunderbird

#### Packaging instructions
Download the repository, zip it and rename it to .xpi

In linux it can be done with
* `git clone https://github.com/Garoe/ThunderKeepPlus`
* `cd ./ThunderKeepPlus`
* `VERSION=$(cat ./install.rdf | grep "<em:version>.*</em:version>" | sed -r 's:</?em\:version>::g')`
* `zip -r "../ThunderKeepPlus-${VERSION}-tb.xpi" *`

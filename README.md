# Letterboxd Review Filter

A Firefox extension for hiding short and low-substance reviews in Letterboxd feeds. It runs locally in the browser and does not collect review data.

## Features

- Hides reviews at or below a configurable word limit (20 words by default)
- Flags longer reviews that match several low-substance patterns
- Lets you reveal any collapsed review in place

## Install locally

1. Open `about:debugging#/runtime/this-firefox` in Firefox.
2. Select **Load Temporary Add-on**.
3. Choose this directory's `manifest.json` file.
4. Reload any open Letterboxd tabs.

Temporary add-ons are removed when Firefox restarts.

## Settings

The toolbar popup controls whether filtering is enabled, the automatic word limit, and the threshold used for longer reviews.

## Development

After a source change, reload the add-on from `about:debugging` and refresh the Letterboxd tab.

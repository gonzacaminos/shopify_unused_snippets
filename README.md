# Shopify Unused files

A super simple tools to find unused assets/snippets/sections on your Shopify theme.

## Setup

- Clone this repo and run `yarn` or `npm i` to install the dependencies.
- Rename `.env.example` into `.env` and set your Shopify Root folder path relative to this directory, for example: '../my-shopify-theme'
- Run `yarn start` or `npm run start` and follow the prompt.
- Once the search has finished check the **data** folder, a `*.json` file will be created containing all matches for your search and an `unused_*.json` containing all files that aren't being used.

## Disclaimer

This just searches for `string` occurrences of your file names on your Shopify directory, you should be cautious while using this tool as it can't detect dynamic include imports (which are a bad idea anyway).

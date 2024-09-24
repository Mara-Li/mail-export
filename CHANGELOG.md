# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

## [2.0.3](https://github.com/Mara-Li/Archivette/compare/v2.0.2...v2.0.3) (2024-09-24)


### Bug Fixes

* add options for getAttachments and refactor class for Msg & Eml ([0657ad1](https://github.com/Mara-Li/Archivette/commit/0657ad1e3c06d3bd1dab66204e520d6fb783cf03))

## [2.0.2](https://github.com/Mara-Li/Archivette/compare/v2.0.1...v2.0.2) (2024-09-24)

## [2.0.1](https://github.com/Mara-Li/Archivette/compare/v2.0.0...v2.0.1) (2024-09-23)

## [2.0.0](https://github.com/Mara-Li/Archivette/compare/v1.3.0...v2.0.0) (2024-09-23)


### ⚠ BREAKING CHANGES

*  - Constructor was made private
 - Parser needs to be loaded as `await EmlParser.init(file, options)`
 - getAsHtml needs to be awaited only in MessageParser
 - Options can be overridden only in getAsHtml and getEmbedded

### Features

* refactor ([07f1e7f](https://github.com/Mara-Li/Archivette/commit/07f1e7faf2a390eebc27fb3ee9c7e438925d470e))

## [1.3.0](https://github.com/Mara-Li/Archivette/compare/v1.2.5...v1.3.0) (2024-09-13)


### Features

* allow custom style & remove style from loaded html ([9991114](https://github.com/Mara-Li/Archivette/commit/9991114d1d707bf2b52a2c55d9eda2e0a81accb3))

## [1.2.5](https://github.com/Mara-Li/Archivette/compare/v1.2.4...v1.2.5) (2024-09-13)


### Bug Fixes

* broken margin ([6e738de](https://github.com/Mara-Li/Archivette/commit/6e738de2ca2bc13c171d6bc39953cc3f992b7010))

## [1.2.4](https://github.com/Mara-Li/Archivette/compare/v1.2.3...v1.2.4) (2024-09-11)


### Bug Fixes

* blank title in some pdf reader ([07dba80](https://github.com/Mara-Li/Archivette/commit/07dba80f6c29213bdbdd6f25ac8324dd2ae38f9a))

## [1.2.3](https://github.com/Mara-Li/Archivette/compare/v1.2.2...v1.2.3) (2024-09-11)

## [1.2.2](https://github.com/Mara-Li/Archivette/compare/v1.2.1...v1.2.2) (2024-09-04)


### Bug Fixes

* **urgent:** remove test ligne ([114cc9b](https://github.com/Mara-Li/Archivette/commit/114cc9bf596358ae2bda6e5b862f7bddbf1498be))

## [1.2.1](https://github.com/Mara-Li/Archivette/compare/v1.2.0...v1.2.1) (2024-09-04)


### Bug Fixes

* **dep:** dedent not found ([5683796](https://github.com/Mara-Li/Archivette/commit/5683796510e262a957f8985d750f742a8ff771d5))

## [1.2.0](https://github.com/Mara-Li/Archivette/compare/v1.1.2...v1.2.0) (2024-09-04)


### Features

* **deps:** add date-fns library to package.json ([dec38da](https://github.com/Mara-Li/Archivette/commit/dec38da3145a51c588fa72414dfad2241427ab75))
* **deps:** add ts-dedent package for improved string handling (issue [#123](https://github.com/Mara-Li/Archivette/issues/123)) ([e36a737](https://github.com/Mara-Li/Archivette/commit/e36a7376ae120318df1eada7a541d9052a0e7145))
* enhance email formatting in utils and improve pdf parsing ([2c9c149](https://github.com/Mara-Li/Archivette/commit/2c9c1493b5bb0e2bceedbb123ff4fcb2aeee58bf))
* Refactor Converter functions and improve error handling ([8143e6f](https://github.com/Mara-Li/Archivette/commit/8143e6f789b98e571d7a8ddd62e5437ceb7c314b))
* update .gitignore to exclude additional file types ([ffb8b97](https://github.com/Mara-Li/Archivette/commit/ffb8b9717db89f4a3469c1cffd98f78f3697044b))
* update email table labels to use uppercase and improve header ([62128d0](https://github.com/Mara-Li/Archivette/commit/62128d0987efaf4d39771b5e36e5afd96a642412))


### Bug Fixes

* correct typos and formatting in README.md ([f2d105c](https://github.com/Mara-Li/Archivette/commit/f2d105c5a6b2a95209e2f3d08f5f4951f36f913e))
* page added when generated ([aaab610](https://github.com/Mara-Li/Archivette/commit/aaab610757cfb0ea11469be24796cb0fcc1228d6))

## [1.1.2](https://github.com/Mara-Li/Archivette/compare/v1.1.1...v1.1.2) (2024-08-30)

## 1.1.1 (2024-08-30)

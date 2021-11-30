#!/usr/bin/env node

const tar = require('tar')
const [archive, ...files] = process.argv.slice(2)

if (typeof archive === 'undefined') {
  throw new Error('archive path is required!')
}
if (files.length < 1) {
  throw new Error('no files specified!')
}

tar.c(
  {
    gzip: true,
    file: archive.startsWith('.tar.gz') ? archive : archive + '.tar.gz',
  },
  files,
)

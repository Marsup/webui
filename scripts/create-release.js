import fs from 'fs';
import { debug, setFailed } from '@actions/core';
import { GitHub, context } from '@actions/github';

async function run() {
  const { repo } = context;
  const github = new GitHub(process.env.GITHUB_TOKEN);

  const args = process.argv.slice(2);
  try {
    const { data } = await github.repos.createRelease({
      ...repo,
      tag_name: args[0],
      prerelease: false,
    });

    debug(data);

    const fileStream = fs.createReadStream('/tmp/dist.zip');
    const stats = fs.statSync('/tmp/dist.zip');

    await github.repos.uploadAsset({
      url: data.upload_url,
      file: fileStream,
      contentType: 'application/zip',
      contentLength: stats.size,
      name: 'dist.zip',
      label: 'Production Build',
    });
  } catch (err) {
    setFailed(`Problem uploading release ${err}`);
  }
}
run();

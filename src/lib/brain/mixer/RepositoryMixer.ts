import simpleGit from 'simple-git';
import * as fs from 'fs-extra';
import * as path from 'path';

export class RepositoryMixer {
  async mix(logicRepoUrl: string, contentRepoUrl: string, targetDir: string) {
    const logicDir = path.join(targetDir, 'logic_temp');
    const contentDir = path.join(targetDir, 'content_temp');
    const outputDir = path.join(targetDir, 'mixed_project');

    const git = simpleGit();
    
    // Ensure dirs exist
    await fs.ensureDir(logicDir);
    await fs.ensureDir(contentDir);
    
    await git.clone(logicRepoUrl, logicDir);
    await git.clone(contentRepoUrl, contentDir);

    await fs.ensureDir(outputDir);

    // Heuristic mix of logic and assets
    if (await fs.pathExists(path.join(logicDir, 'src'))) {
      await fs.copy(path.join(logicDir, 'src'), path.join(outputDir, 'src'));
    }
    if (await fs.pathExists(path.join(contentDir, 'assets'))) {
      await fs.copy(path.join(contentDir, 'assets'), path.join(outputDir, 'assets'));
    }
    if (await fs.pathExists(path.join(contentDir, 'data'))) {
      await fs.copy(path.join(contentDir, 'data'), path.join(outputDir, 'data'));
    }

    // Cleanup
    await fs.remove(logicDir);
    await fs.remove(contentDir);

    return outputDir;
  }
}

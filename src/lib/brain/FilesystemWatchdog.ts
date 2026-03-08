
import * as chokidar from 'chokidar';
import { WSServer } from './ws/WSServer';

export class FilesystemWatchdog {
  private watcher: any = null;
  private logs: string[] = [];
  private wsServer: WSServer | null = null;

  setWSServer(wsServer: WSServer) {
    this.wsServer = wsServer;
  }

  watch(targetDir: string) {
    this.watcher = chokidar.watch(targetDir, {
      ignored: /(^|[\/\\])\../,
      persistent: true
    });

    this.watcher
      .on('add', (path: string) => this.log(`File ${path} has been added`))
      .on('change', (path: string) => this.log(`File ${path} has been changed`))
      .on('unlink', (path: string) => this.log(`File ${path} has been removed`))
      .on('error', (error: any) => this.log(`Watcher error: ${error}`));
  }

  private log(message: string) {
    this.logs.push(message);
    console.warn(`[WATCHDOG]: ${message}`);
    if (this.wsServer) {
      this.wsServer.broadcast(message);
    }
  }

  getLogs() {
    return this.logs;
  }
}

declare module 'three/examples/jsm/loaders/OBJLoader' {
  import { Loader, LoadingManager, Object3D } from 'three';

  export class OBJLoader extends Loader {
    constructor(manager?: LoadingManager);

    load(
        url: string,
        onLoad: (object: Object3D) => void,
        onProgress?: (event: ProgressEvent<EventTarget>) => void,
        onError?: (event: ErrorEvent) => void
    ): void;
  }
}
import { ILoader } from './loader';
import { SocketLoader } from './socket-loader';
import { RootLoader } from './root-loader';

const loaders: ILoader[] = [new SocketLoader()];

export const rootLoader = new RootLoader(loaders);

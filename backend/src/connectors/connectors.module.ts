import { Module } from '@nestjs/common';
import { BlinkitConnector } from './blinkit.connector';
import { ZeptoConnector } from './zepto.connector';
import { InstamartConnector } from './instamart.connector';
import { BigBasketConnector } from './bigbasket.connector';

export const CONNECTORS = 'CONNECTORS';

@Module({
  providers: [
    BlinkitConnector,
    ZeptoConnector,
    InstamartConnector,
    BigBasketConnector,
    {
      provide: CONNECTORS,
      useFactory: (
        blinkit: BlinkitConnector,
        zepto: ZeptoConnector,
        instamart: InstamartConnector,
        bigbasket: BigBasketConnector,
      ) => [blinkit, zepto, instamart, bigbasket],
      inject: [BlinkitConnector, ZeptoConnector, InstamartConnector, BigBasketConnector],
    },
  ],
  exports: [CONNECTORS],
})
export class ConnectorsModule {}

import { Module } from '@nestjs/common';
import { BlinkitConnector } from './blinkit.connector';
import { ZeptoConnector } from './zepto.connector';
import { InstamartConnector } from './instamart.connector';
import { BigBasketConnector } from './bigbasket.connector';
import { AmazonFreshConnector } from './amazonfresh.connector';

export const CONNECTORS = 'CONNECTORS';

@Module({
  providers: [
    BlinkitConnector,
    ZeptoConnector,
    InstamartConnector,
    BigBasketConnector,
    AmazonFreshConnector,
    {
      provide: CONNECTORS,
      useFactory: (
        blinkit: BlinkitConnector,
        zepto: ZeptoConnector,
        instamart: InstamartConnector,
        bigbasket: BigBasketConnector,
        amazonfresh: AmazonFreshConnector,
      ) => [blinkit, zepto, instamart, bigbasket, amazonfresh],
      inject: [BlinkitConnector, ZeptoConnector, InstamartConnector, BigBasketConnector, AmazonFreshConnector],
    },
  ],
  exports: [CONNECTORS],
})
export class ConnectorsModule {}

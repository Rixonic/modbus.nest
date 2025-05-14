import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ModbusService } from './modbus.service';
import { LaboratoryModule } from '../../services/laboratorio/laboratory.module';
import { EventsGateway } from '../../events/events.gateway';
import { TelegramModule } from '../../telegram/telegram.module';
import { TelegramService } from '../../telegram/telegram.service';
@Module({
  imports: [
    ScheduleModule.forRoot(),
    LaboratoryModule,
    TelegramModule,
    //TypeOrmModule.forFeature([Sensor])
  ],
  providers: [ModbusService, EventsGateway, TelegramService],
  exports: [ModbusService]
})
export class ModbusLaboratoryModule {} 
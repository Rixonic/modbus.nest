import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ModbusService } from './modbus.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sensor } from '../../sensors/sensor.entity';
import { LaboratoryModule } from '../../services/laboratorio/laboratory.module';
import { EventsGateway } from '../../events/events.gateway';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    LaboratoryModule,
    //TypeOrmModule.forFeature([Sensor])
  ],
  providers: [ModbusService, EventsGateway],
  exports: [ModbusService]
})
export class ModbusLaboratoryModule {} 
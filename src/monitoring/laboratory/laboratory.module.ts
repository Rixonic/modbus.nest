import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ModbusService } from './modbus.service';
import { LaboratoryGateway } from './websocket.gateway';
import { SensorService } from '../../services/laboratorio/laboratory.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sensor } from '../../sensors/sensor.entity';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([Sensor])
  ],
  providers: [ModbusService, LaboratoryGateway, SensorService],
  exports: [ModbusService, LaboratoryGateway]
})
export class ModbusLaboratoryModule {} 
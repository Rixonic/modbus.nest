import { WebSocketGateway, WebSocketServer, SubscribeMessage } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { ModbusService } from './modbus.service';

interface Sensor {
  id: number;
  name: string;
  sensorId: string;
  labId: string;
  type: 'HELADERA' | 'FREEZER' | 'ESTUFA' | 'AMBIENTE';
  location: string;
  tempAddr: number;
  max: number;
  min: number;
  time: number;
  alert: boolean;
  offset?: number;
  temp: number | null;
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'laboratory'
})
export class LaboratoryGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly modbusService: ModbusService) {}

  @SubscribeMessage('getSensors')
  handleGetSensors(): Sensor[] {
    return this.modbusService.getSensors();
  }

  @SubscribeMessage('updateSensor')
  handleUpdateSensor(client: Socket, payload: { sensorId: string; data: Partial<Sensor> }): Promise<Sensor> {
    return this.modbusService.updateSensor(payload.sensorId, payload.data);
  }

  emitSensorUpdate(sensors: Sensor[]): void {
    this.server.emit('sensorUpdate', sensors);
  }
} 
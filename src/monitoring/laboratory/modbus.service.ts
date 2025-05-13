import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import ModbusClient from 'modbus-serial';
import { SensorService } from '../../services/laboratorio/laboratory.service';
import { sensorsAddr } from '../../../utils/const';
import { EventsGateway } from '../../events/events.gateway';

interface Sensor {
  id: number;
  name: string;
  sensorId: string;
  labId: string;
  type: string;
  location: string;
  tempAddr: number;
  max: number;
  min: number;
  time: number;
  alert: boolean;
  offset: number;
  temp: number | null;
}

interface MessageControl {
  sensorId: string;
  isCanceled: boolean;
  timer: number;
  groupIndex: number;
}

@Injectable()
export class ModbusService implements OnModuleInit, OnModuleDestroy {
  private client: ModbusClient;
  private sensors: Sensor[] = [];
  private messageControl: MessageControl[] = [];
  private time: { [key: string]: number } = {};
  private isReading: boolean = false;
  private readingInterval: NodeJS.Timeout;

  constructor(
    private readonly sensorsService: SensorService,
    private readonly eventsGateway: EventsGateway
  ) {
    this.initializeModbusClient();
  }

  async onModuleInit() {
    try {
      // Obtener sensores desde la base de datos
      const dbSensors = await this.sensorsService.findAll();
      
      // Convertir los sensores de la BD al formato requerido


      // Configurar los sensores
      this.setSensors(dbSensors);

      // Iniciar la lectura de temperaturas
      await this.startReading();
    } catch (error) {
      console.error('Error al cargar sensores desde la base de datos:', error);
    }
  }

  private async initializeModbusClient() {
    this.client = new ModbusClient();
    try {
      await this.client.connectTCP('192.168.90.235', { port: 502 });
      console.log('Conexión Modbus establecida');
    } catch (error) {
      console.error('Error al conectar con Modbus:', error);
    }
  }

  private registersToFloat(registers: number[]): number {
    const value = (registers[0] << 16) + registers[1];
    return Buffer.from([
      (value >> 24) & 0xff,
      (value >> 16) & 0xff,
      (value >> 8) & 0xff,
      value & 0xff,
    ]).readFloatBE(0);
  }

  async startReading() {
    if (this.isReading) return;
    this.isReading = true;
    
    // Iniciar el intervalo de lectura
    this.readingInterval = setInterval(async () => {
      try {
        await this.readTemperatures();
      } catch (error) {
        console.error('Error en la lectura de temperaturas:', error);
      }
    }, 1000); // Leer cada segundo
  }

  stopReading() {
    if (this.readingInterval) {
      clearInterval(this.readingInterval);
    }
    this.isReading = false;
  }

  async onModuleDestroy() {
    this.stopReading();
  }

  async readTemperatures() {
    for (const sensor of this.sensors) {
      try {
        const tempRegs = await this.client.readHoldingRegisters(sensor.tempAddr, 2);
        const temp = parseFloat((this.registersToFloat(tempRegs.data) - (sensor.offset)).toFixed(2));

        if (temp > 1000 || temp < -1000) {
          sensor.temp = null;
        } else {
          sensor.temp = temp;
        }

        if (sensor.temp === null || sensor.temp > sensor.max || sensor.temp < sensor.min) {
          const messageControl = this.messageControl.find(mc => mc.sensorId === sensor.sensorId);
          if (messageControl) {
            if (messageControl.timer > 0) {
              messageControl.timer -= 1;
            } else {
              sensor.alert = true;
            }
          }
        } else {
          sensor.alert = false;
          const messageControl = this.messageControl.find(mc => mc.sensorId === sensor.sensorId);
          if (messageControl) {
            messageControl.timer = this.time[sensor.sensorId];
          }
        }
      } catch (error) {
        console.error(`Error al leer temperatura del sensor ${sensor.sensorId}:`, error);
      }
    }
    // Emitir actualización de sensores a través del WebSocket
    console.log(`Hora de envío: ${new Date().toLocaleTimeString()}`);
    this.eventsGateway.broadcastLaboratoryData(this.sensors);
  }

  async updateSensor(sensorId: string, data: Partial<Sensor>) {
    const sensor = this.sensors.find(s => s.sensorId === sensorId);
    if (!sensor) {
      throw new Error('Sensor no encontrado');
    }

    Object.assign(sensor, data);
    if (data.time !== undefined) {
      this.time[sensorId] = data.time;
    }
    
    // Emitir actualización después de modificar el sensor
    this.eventsGateway.broadcastLaboratoryData(this.sensors);
    return sensor;
  }

  getSensors(): Sensor[] {
    return this.sensors;
  }

  setSensors(sensors: Omit<Sensor, 'temp' | 'alert'|'tempAddr'>[]) {
    this.sensors = sensors.map(sensor => ({
      ...sensor,
      temp: null,
      alert: false,
      tempAddr: sensorsAddr.find(addr => addr.sensorId === sensor.sensorId)?.tempAddr || 0
    }));

    this.time = {};
    this.messageControl = [];

    sensors.forEach(sensor => {
      this.time[sensor.sensorId] = sensor.time;
      this.messageControl.push({
        sensorId: sensor.sensorId,
        isCanceled: false,
        timer: 0,
        groupIndex: 0
      });
    });

    // Emitir actualización después de configurar los sensores
    //this.eventsGateway.broadcastLaboratoryData(this.sensors);
  }
}

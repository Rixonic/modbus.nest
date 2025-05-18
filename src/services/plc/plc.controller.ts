import { Controller, Get } from '@nestjs/common';
import { PLCService } from './plc.service';
import { Alarms } from 'src/plc/plc.entity';

@Controller('plc')
export class PLCController {
  constructor(private readonly PLCService: PLCService) {}

  //Manejo de sensores

  @Get('/alarms')
  findAll(): Promise<Alarms[]> {
    return this.PLCService.findAll();
  }
}

import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export abstract class Sensor extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  sensorId: string;

  @Column()
  labId: string;

  @Column({ default: 2 })
  max: number;

  @Column({ default: 8 })
  min: number;

  @Column({ default: 3600 })
  time: number;

  @Column({ default: 0 })
  offset: number;

  @Column({ default: 'Heladera' })
  type: string;

  @Column()
  location: string;
}

@Entity({ name: 'sensors', schema: 'enfermeria', database: 'sensors' })
export class NurserySensor extends Sensor {}

@Entity({ name: 'sensors', schema: 'laboratorio', database: 'sensors' })
export class LaboratorySensor extends Sensor {}

@Entity({ name: 'sensors', schema: 'farmacia', database: 'sensors' })
export class FarmacySensor extends Sensor {}

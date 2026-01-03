import { Entity, Column, PrimaryColumn, CreateDateColumn, Index } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity('event_log')
@Index(['eventId'], { unique: true })
@Index(['eventType'])
@Index(['status'])
export class EventLog {
  @PrimaryColumn('varchar')
  id: string;

  @Column()
  eventId: string;

  @Column()
  eventType: string;

  @Column()
  topic: string;

  @Column('jsonb')
  payload: any;

  @Column()
  status: string; // 'processed', 'failed', 'pending'

  @Column({ nullable: true })
  errorMessage: string;

  @CreateDateColumn()
  processedAt: Date;

  constructor() {
    this.id = uuidv4();
  }
}

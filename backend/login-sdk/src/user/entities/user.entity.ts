import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity({ name: 'User' })
export class User {

  @PrimaryGeneratedColumn({ name: 'Id' })
  id: number;

  @Column({ name: 'UserId', type: 'varchar', length: 50, nullable: true })
  userId: string | null;

  @Column({ name: 'Password', type: 'varchar', length: 150, nullable: true })
  password: string | null;

  @Column({ name: 'Salt', type: 'varchar', length: 150, nullable: true })
  salt: string | null;

  @Column({ name: 'Role', type: 'varchar', length: 50, nullable: true })
  role: string | null;

  @Column({ name: 'RefreshToken', type: 'text', nullable: true })
  refreshToken: string | null;

  @Column({ name: 'RefreshTokenExpiryTime', nullable: true })
  refreshTokenExpiryTime: Date;

  @Column({ name: 'NIC', type: 'varchar', length: 50, nullable: true })
  refNo: string | null;

  @Column({ name: 'ContactNo', type: 'varchar', length: 50, nullable: true })
  contactNo: string | null;

  @Column({ name: 'IsActive', type: 'int', default: 1 })
  isActive: number;

  @Column({ name: 'ExtraText1', type: 'varchar', length: 50, nullable: true })
  extraText1: string | null;

  @Column({ name: 'ExtraText2', type: 'varchar', length: 100, nullable: true })
  extraText2: string | null;

  @Column({ name: 'ExtraText3', type: 'varchar', length: 150, nullable: true })
  extraText3: string | null;

  @Column({ name: 'Extratext4', type: 'text', nullable: true })
  extratext4: string | null;

  @Column({ name: 'ExtraInt1', type: 'int', nullable: true })
  extraInt1: number | null;

  @Column({ name: 'ExtraInt2', type: 'int', nullable: true })
  extraInt2: number | null;

  @Column({ name: 'ExtraInt3', type: 'int', nullable: true })
  extraInt3: number | null;

  @Column({ name: 'Createby', type: 'varchar', length: 50, nullable: true })
  createby: string | null;

}
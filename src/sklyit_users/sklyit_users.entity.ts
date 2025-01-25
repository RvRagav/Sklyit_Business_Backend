import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { IsString, IsEmail, IsDate } from 'class-validator';
import { Booking } from 'src/bsbookings/bsbookings.entity';

@Entity('SKLYIT_users')
export class Users {
  @PrimaryGeneratedColumn()
  userId: string;//

  @Column()
  @IsString()
  name: string;

  @Column()
  @IsEmail()
  gmail: string;

  @Column()
  @IsString()
  password: string;

  @Column({ type: 'date', name: 'date_of_birth' })
  @IsDate()
  dob: Date;

  @Column({ nullable: true })
  @IsString()
  imgurl: string;

  @Column()
  @IsString()
  mobileno: string;

  @Column()
  @IsString()
  wtappNo: string;

  @Column({ nullable: true })
  @IsString()
  gender: string;

  @Column({ name: 'address_doorno', nullable: true })
  addressDoorno: string;

  @Column({ name: 'address_street', nullable: true })
  addressStreet: string;

  @Column({ name: 'address_city' })
  addressCity: string;

  @Column({ name: 'address_state' })
  addressState: string;

  @Column({ name: 'address_pincode', nullable: true })
  addressPincode: string;

  @Column()
  @IsString()
  usertype: string;

  @Column('date', { default: () => 'CURRENT_DATE' })
  dateofjoining: Date;

  @OneToMany(() => Booking, (booking) => booking.customer)
  bookings: Booking[];

  @Column({ nullable: true })
  @IsString()
  fcm_token: string;
}

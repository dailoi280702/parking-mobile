export type HomeStackParams = {
  HomeScreen: undefined;
  ParkingDetailsScreen: any;
  SelectVehicleScreen: any;
  ReserveParkingScreen: any;
  SelectParkingSlotScreen: any;
  SelectPaymentScreen: any;
  SummaryScreen: any;
  ParkingTicketScreen: any;
};

export type BookingHistoryStackParams = {
  BookingHistoryScreen: undefined;
  ExntendTicket: { ticketWithExtend: Ticket };
};

export type ProfileStackParams = {
  ProfileScreen: undefined;
};

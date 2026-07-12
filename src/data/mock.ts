import type { Household, Member, AppUser } from '@/types'

export const mockUsers: AppUser[] = [
  {
    id: 'user-1',
    full_name: 'Rodrigo Santos',
    email: 'admin@ward.org',
    role: 'admin',
    created_at: '2024-01-10T08:00:00Z',
    is_active: true,
  },
  {
    id: 'user-2',
    full_name: 'Maria Dela Cruz',
    email: 'specialist@ward.org',
    role: 'account_specialist',
    created_at: '2024-01-15T08:00:00Z',
    is_active: true,
  },
  {
    id: 'user-3',
    full_name: 'Jose Reyes',
    email: 'clerk@ward.org',
    role: 'clerk',
    created_at: '2024-02-01T08:00:00Z',
    is_active: true,
  },
  {
    id: 'user-4',
    full_name: 'Ana Villanueva',
    email: 'ministering@ward.org',
    role: 'ministering',
    created_at: '2024-02-15T08:00:00Z',
    is_active: true,
  },
  {
    id: 'user-5',
    full_name: 'Lorna Magbanua',
    email: 'secretary@ward.org',
    role: 'secretary',
    created_at: '2024-02-20T08:00:00Z',
    is_active: true,
  },
]

export const mockHouseholds: Household[] = [
  { id: 'hh-1', name: 'Santos Family', address: '14 Sampaguita St., Brgy. San Jose', created_at: '2024-01-10T08:00:00Z' },
  { id: 'hh-2', name: 'Dela Cruz Family', address: '7 Mabini Ave., Brgy. Poblacion', created_at: '2024-01-10T08:00:00Z' },
  { id: 'hh-3', name: 'Reyes Household', address: '23 Rizal St., Brgy. Bagong Silang', created_at: '2024-01-10T08:00:00Z' },
  { id: 'hh-4', name: 'Garcia Family', address: '5 Magsaysay Blvd., Brgy. Pag-asa', created_at: '2024-01-10T08:00:00Z' },
  { id: 'hh-5', name: 'Villanueva Household', address: '31 Aguinaldo Rd., Brgy. Sta. Cruz', created_at: '2024-01-10T08:00:00Z' },
  { id: 'hh-6', name: 'Mendoza Family', address: '9 Luna St., Brgy. San Isidro', created_at: '2024-01-10T08:00:00Z' },
  { id: 'hh-7', name: 'Torres Household', address: '18 Quezon Ave., Brgy. Maliksi', created_at: '2024-01-10T08:00:00Z' },
  { id: 'hh-8', name: 'Ramos Family', address: '2 Bonifacio Rd., Brgy. Bulihan', created_at: '2024-01-10T08:00:00Z' },
  { id: 'hh-9', name: 'Castillo Household', address: '44 Del Pilar St., Brgy. Halang', created_at: '2024-01-10T08:00:00Z' },
  { id: 'hh-10', name: 'Bautista Family', address: '6 Quezon St., Brgy. Paliparan', created_at: '2024-01-10T08:00:00Z' },
]

export const mockMembers: Member[] = [
  // Santos Family — assigned to Ana Villanueva
  { id: 'm-1', household_id: 'hh-1', first_name: 'Carlos', last_name: 'Santos', phone: '09171234567', email: 'carlos.santos@email.com', status: 'active', notes: 'Confirmed present at home visit on March 2025.', assigned_to: 'Ana Villanueva', updated_by: 'user-1', updated_at: '2025-03-15T10:30:00Z', created_at: '2024-01-10T08:00:00Z' },
  { id: 'm-2', household_id: 'hh-1', first_name: 'Lourdes', last_name: 'Santos', phone: '09171234568', email: null, status: 'active', notes: '', assigned_to: 'Ana Villanueva', updated_by: 'user-1', updated_at: '2025-03-15T10:30:00Z', created_at: '2024-01-10T08:00:00Z' },
  { id: 'm-3', household_id: 'hh-1', first_name: 'Marco', last_name: 'Santos', phone: null, email: null, status: 'unknown', notes: 'Not seen at recent visits. May have moved.', assigned_to: 'Ana Villanueva', updated_by: 'user-4', updated_at: '2025-04-02T09:00:00Z', created_at: '2024-01-10T08:00:00Z' },
  // Dela Cruz Family — assigned to Jose Reyes
  { id: 'm-4', household_id: 'hh-2', first_name: 'Roberto', last_name: 'Dela Cruz', phone: '09281234567', email: 'roberto.dc@email.com', status: 'active', notes: '', assigned_to: 'Jose Reyes', updated_by: 'user-2', updated_at: '2025-04-10T14:00:00Z', created_at: '2024-01-10T08:00:00Z' },
  { id: 'm-5', household_id: 'hh-2', first_name: 'Teresita', last_name: 'Dela Cruz', phone: '09281234568', email: null, status: 'active', notes: '', assigned_to: 'Jose Reyes', updated_by: 'user-2', updated_at: '2025-04-10T14:00:00Z', created_at: '2024-01-10T08:00:00Z' },
  { id: 'm-6', household_id: 'hh-2', first_name: 'Angelo', last_name: 'Dela Cruz', phone: null, email: 'angelo.dc@email.com', status: 'transferred', notes: 'Transferred to Dasmarinas Ward per his request.', assigned_to: 'Jose Reyes', updated_by: 'user-2', updated_at: '2025-02-28T11:00:00Z', created_at: '2024-01-10T08:00:00Z' },
  // Reyes Household — assigned to Maria Dela Cruz
  { id: 'm-7', household_id: 'hh-3', first_name: 'Fernando', last_name: 'Reyes', phone: '09391234567', email: null, status: 'moved_out', notes: 'Family relocated to Cavite. Address unknown.', assigned_to: 'Maria Dela Cruz', updated_by: 'user-3', updated_at: '2025-03-01T08:30:00Z', created_at: '2024-01-10T08:00:00Z' },
  { id: 'm-8', household_id: 'hh-3', first_name: 'Rosario', last_name: 'Reyes', phone: null, email: null, status: 'moved_out', notes: 'Moved with Fernando.', assigned_to: 'Maria Dela Cruz', updated_by: 'user-3', updated_at: '2025-03-01T08:30:00Z', created_at: '2024-01-10T08:00:00Z' },
  { id: 'm-9', household_id: 'hh-3', first_name: 'Rina', last_name: 'Reyes', phone: '09391234569', email: 'rina.reyes@email.com', status: 'active', notes: 'Daughter stayed in the area.', assigned_to: 'Maria Dela Cruz', updated_by: 'user-1', updated_at: '2025-04-15T16:00:00Z', created_at: '2024-01-10T08:00:00Z' },
  // Garcia Family — assigned to Ana Villanueva
  { id: 'm-10', household_id: 'hh-4', first_name: 'Eduardo', last_name: 'Garcia', phone: '09451234567', email: 'eduardo.garcia@email.com', status: 'active', notes: '', assigned_to: 'Ana Villanueva', updated_by: 'user-2', updated_at: '2025-04-20T09:00:00Z', created_at: '2024-01-10T08:00:00Z' },
  { id: 'm-11', household_id: 'hh-4', first_name: 'Carmelita', last_name: 'Garcia', phone: null, email: null, status: 'active', notes: '', assigned_to: 'Ana Villanueva', updated_by: 'user-2', updated_at: '2025-04-20T09:00:00Z', created_at: '2024-01-10T08:00:00Z' },
  { id: 'm-12', household_id: 'hh-4', first_name: 'Luis', last_name: 'Garcia', phone: '09451234569', email: null, status: 'unknown', notes: 'Working abroad. Status unverified.', assigned_to: 'Ana Villanueva', updated_by: 'user-4', updated_at: '2025-01-10T08:00:00Z', created_at: '2024-01-10T08:00:00Z' },
  // Villanueva Household — assigned to Rodrigo Santos
  { id: 'm-13', household_id: 'hh-5', first_name: 'Ricardo', last_name: 'Villanueva', phone: '09561234567', email: null, status: 'active', notes: '', assigned_to: 'Rodrigo Santos', updated_by: 'user-1', updated_at: '2025-04-25T10:00:00Z', created_at: '2024-01-10T08:00:00Z' },
  { id: 'm-14', household_id: 'hh-5', first_name: 'Natividad', last_name: 'Villanueva', phone: '09561234568', email: 'naty.v@email.com', status: 'active', notes: 'Active in Relief Society.', assigned_to: 'Rodrigo Santos', updated_by: 'user-1', updated_at: '2025-04-25T10:00:00Z', created_at: '2024-01-10T08:00:00Z' },
  // Mendoza Family — assigned to Jose Reyes
  { id: 'm-15', household_id: 'hh-6', first_name: 'Gregorio', last_name: 'Mendoza', phone: '09671234567', email: null, status: 'transferred', notes: 'Now attending Silang Ward.', assigned_to: 'Jose Reyes', updated_by: 'user-3', updated_at: '2025-03-20T13:00:00Z', created_at: '2024-01-10T08:00:00Z' },
  { id: 'm-16', household_id: 'hh-6', first_name: 'Pacita', last_name: 'Mendoza', phone: null, email: null, status: 'transferred', notes: 'Transferred with Gregorio.', assigned_to: 'Jose Reyes', updated_by: 'user-3', updated_at: '2025-03-20T13:00:00Z', created_at: '2024-01-10T08:00:00Z' },
  { id: 'm-17', household_id: 'hh-6', first_name: 'Bong', last_name: 'Mendoza', phone: '09671234569', email: 'bong.mendoza@email.com', status: 'active', notes: 'Son stays in the area.', assigned_to: 'Jose Reyes', updated_by: 'user-2', updated_at: '2025-04-12T11:00:00Z', created_at: '2024-01-10T08:00:00Z' },
  // Torres Household — assigned to Maria Dela Cruz
  { id: 'm-18', household_id: 'hh-7', first_name: 'Alfredo', last_name: 'Torres', phone: '09781234567', email: null, status: 'active', notes: '', assigned_to: 'Maria Dela Cruz', updated_by: 'user-4', updated_at: '2025-04-18T15:30:00Z', created_at: '2024-01-10T08:00:00Z' },
  { id: 'm-19', household_id: 'hh-7', first_name: 'Milagros', last_name: 'Torres', phone: '09781234568', email: null, status: 'active', notes: '', assigned_to: 'Maria Dela Cruz', updated_by: 'user-4', updated_at: '2025-04-18T15:30:00Z', created_at: '2024-01-10T08:00:00Z' },
  { id: 'm-20', household_id: 'hh-7', first_name: 'Danilo', last_name: 'Torres', phone: null, email: 'danilo.torres@email.com', status: 'unknown', notes: 'Could not be reached. No one answers the door.', assigned_to: 'Maria Dela Cruz', updated_by: 'user-4', updated_at: '2025-02-14T10:00:00Z', created_at: '2024-01-10T08:00:00Z' },
  // Ramos Family — assigned to Rodrigo Santos
  { id: 'm-21', household_id: 'hh-8', first_name: 'Bernardo', last_name: 'Ramos', phone: '09891234567', email: null, status: 'active', notes: '', assigned_to: 'Rodrigo Santos', updated_by: 'user-2', updated_at: '2025-04-22T09:45:00Z', created_at: '2024-01-10T08:00:00Z' },
  { id: 'm-22', household_id: 'hh-8', first_name: 'Corazon', last_name: 'Ramos', phone: null, email: null, status: 'active', notes: '', assigned_to: 'Rodrigo Santos', updated_by: 'user-2', updated_at: '2025-04-22T09:45:00Z', created_at: '2024-01-10T08:00:00Z' },
  { id: 'm-23', household_id: 'hh-8', first_name: 'Jasmine', last_name: 'Ramos', phone: '09891234569', email: 'jasmine.ramos@email.com', status: 'moved_out', notes: 'Moved to Manila for work.', assigned_to: 'Rodrigo Santos', updated_by: 'user-1', updated_at: '2025-04-01T08:00:00Z', created_at: '2024-01-10T08:00:00Z' },
  // Castillo Household — assigned to Ana Villanueva
  { id: 'm-24', household_id: 'hh-9', first_name: 'Vicente', last_name: 'Castillo', phone: '09912345678', email: null, status: 'active', notes: '', assigned_to: 'Ana Villanueva', updated_by: 'user-3', updated_at: '2025-04-28T14:00:00Z', created_at: '2024-01-10T08:00:00Z' },
  { id: 'm-25', household_id: 'hh-9', first_name: 'Dolores', last_name: 'Castillo', phone: null, email: null, status: 'active', notes: '', assigned_to: 'Ana Villanueva', updated_by: 'user-3', updated_at: '2025-04-28T14:00:00Z', created_at: '2024-01-10T08:00:00Z' },
  // Bautista Family — assigned to Maria Dela Cruz
  { id: 'm-26', household_id: 'hh-10', first_name: 'Ernesto', last_name: 'Bautista', phone: '09022345678', email: 'ernesto.b@email.com', status: 'active', notes: '', assigned_to: 'Maria Dela Cruz', updated_by: 'user-1', updated_at: '2025-05-01T08:00:00Z', created_at: '2024-01-10T08:00:00Z' },
  { id: 'm-27', household_id: 'hh-10', first_name: 'Gloria', last_name: 'Bautista', phone: '09022345679', email: null, status: 'active', notes: '', assigned_to: 'Maria Dela Cruz', updated_by: 'user-1', updated_at: '2025-05-01T08:00:00Z', created_at: '2024-01-10T08:00:00Z' },
  { id: 'm-28', household_id: 'hh-10', first_name: 'Peter', last_name: 'Bautista', phone: null, email: 'peter.b@email.com', status: 'active', notes: 'Recently returned from mission.', assigned_to: 'Maria Dela Cruz', updated_by: 'user-2', updated_at: '2025-04-30T16:00:00Z', created_at: '2024-03-01T08:00:00Z' },
  { id: 'm-29', household_id: 'hh-10', first_name: 'Rachel', last_name: 'Bautista', phone: '09022345680', email: null, status: 'unknown', notes: 'Not present during last 3 visits.', assigned_to: 'Maria Dela Cruz', updated_by: 'user-4', updated_at: '2025-03-25T11:00:00Z', created_at: '2024-01-10T08:00:00Z' },
  { id: 'm-30', household_id: 'hh-9', first_name: 'Mark', last_name: 'Castillo', phone: '09912345680', email: 'mark.castillo@email.com', status: 'transferred', notes: 'Transferred to Imus Ward after marriage.', assigned_to: 'Ana Villanueva', updated_by: 'user-2', updated_at: '2025-03-10T09:00:00Z', created_at: '2024-01-10T08:00:00Z' },
]

export const getHouseholdMembers = (householdId: string): Member[] =>
  mockMembers.filter((m) => m.household_id === householdId)

export const getMember = (memberId: string): Member | undefined =>
  mockMembers.find((m) => m.id === memberId)

export const getHousehold = (householdId: string): Household | undefined =>
  mockHouseholds.find((h) => h.id === householdId)

export const getUserById = (userId: string): AppUser | undefined =>
  mockUsers.find((u) => u.id === userId)

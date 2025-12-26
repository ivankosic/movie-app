export interface Actor {
    _key?: string,
    _id?: string,
    fullName: string,
    dateOfBirth: string
    dateOfDeath?: string,
    age: number,
    imageUrl?: string,
    active?: boolean
}
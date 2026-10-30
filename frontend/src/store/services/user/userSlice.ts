import { hotelApi } from "../baseQuery";

export interface UserRoleItem {
  id: string;
  name: string;
}

export interface RegisteredUser {
  id: string;
  firstName: string;
  lastName?: string;
  email: string;
  phoneNumber?: string;
  createdDate?: string;
  isActive: boolean;
  emailConfirmed: boolean;
  propertyId?: number | null;
  roles: UserRoleItem[];
}

export interface UpdateUserRolePayload {
  userId: string;
  roles: string[];
  propertyId?: number | null;
}

export const userApi = hotelApi.injectEndpoints({
  endpoints: (builder) => ({
    getRegisteredUsers: builder.query<RegisteredUser[], { pageNumber?: number; pageSize?: number } | void>({
      query: (params) => {
        const page = params?.pageNumber || 1;
        const size = params?.pageSize || 50;
        return `/user?pageNumber=${page}&pageSize=${size}`;
      },
      transformResponse: (response: any): RegisteredUser[] => {
        const raw = Array.isArray(response)
          ? response
          : (response?.data ?? response?.items ?? []);
        return raw.map((item: any) => ({
          id: String(item.id || item.userId || ""),
          firstName: item.firstName || "",
          lastName: item.lastName || "",
          email: item.email || "",
          phoneNumber: item.phoneNumber || "",
          createdDate: item.createdDate || "",
          isActive: item.isActive !== false,
          emailConfirmed: item.emailConfirmed === true,
          propertyId: item.propertyId == null ? null : Number(item.propertyId),
          roles: Array.isArray(item.roles)
            ? item.roles.map((r: any) => ({
                id: String(r.id || ""),
                name: String(r.name || r.roleName || r),
              }))
            : [],
        }));
      },
      providesTags: ["Staff"],
    }),

    updateUserRole: builder.mutation<any, UpdateUserRolePayload>({
      query: ({ userId, roles, propertyId }) => ({
        url: `/user/${userId}/role`,
        method: "PUT",
        body: { roles, propertyId: propertyId ?? null },
      }),
      invalidatesTags: ["Staff"],
    }),

    deleteUser: builder.mutation<any, string>({
      query: (userId) => ({
        url: `/user/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Staff"],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetRegisteredUsersQuery,
  useUpdateUserRoleMutation,
  useDeleteUserMutation,
} = userApi;

export default userApi;

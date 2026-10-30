import { hotelApi } from "../baseQuery";

export interface AdminNotification {
  id: number;
  title: string;
  message: string;
  subjectUserId?: string;
  isRead: boolean;
  createdDate?: string;
}

export const notificationApi = hotelApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<AdminNotification[], void>({
      query: () => "/notification",
      transformResponse: (response: any): AdminNotification[] => {
        const raw = Array.isArray(response) ? response : (response?.data ?? []);
        return raw.map((item: any) => ({
          id: Number(item.id),
          title: item.title || "",
          message: item.message || "",
          subjectUserId: item.subjectUserId,
          isRead: item.isRead === true,
          createdDate: item.createdDate,
        }));
      },
      providesTags: ["Notification"],
    }),
    markNotificationRead: builder.mutation<unknown, number>({
      query: (id) => ({
        url: `/notification/${id}/read`,
        method: "PUT",
      }),
      invalidatesTags: ["Notification"],
    }),
  }),
  overrideExisting: true,
});

export const { useGetNotificationsQuery, useMarkNotificationReadMutation } = notificationApi;

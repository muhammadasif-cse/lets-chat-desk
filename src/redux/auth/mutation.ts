/** @format */

import EAPI_METHODS from "../../enums/api-methods";
import APIHeader from "../APIHeader";

const apiTag = APIHeader.enhanceEndpoints({
  addTagTypes: ["Auth"],
});

export const AuthMutations = apiTag.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (data) => ({
        url: `/userservice/user/login`,
        method: EAPI_METHODS.POST,
        body: data,
      }),
    }),
  }),
});

export const { useLoginMutation } = AuthMutations;

export enum ActionType {
  None = '[TransferFlow] None',
  Preparing = '[TransferFlow] Preparing',
  Pending = '[TransferFlow] Pending',
  Success = '[TransferFlow] Success',
  Error = '[TransferFlow] Error',
}

/* Dumb Actions */

export class FlowNone {
  readonly type = ActionType.None;
}

export class FlowPreparing {
  readonly type = ActionType.Preparing;
}

export class FlowPending {
  readonly type = ActionType.Pending;
}

/* Success Action */

export interface FlowSuccessPayload {
  transactionHash: string;
  redirectUrl: string;
}

export class FlowSuccess {
  readonly type = ActionType.Success;

  constructor(public payload: FlowSuccessPayload) {}
}

/* Error Action */

export interface FlowErrorPayload {
  errors: string[];
  redirectUrl: string;
}

export class FlowError {
  readonly type = ActionType.Error;

  constructor(public payload: FlowErrorPayload) {}
}

export type ActionsUnion =
  FlowNone |
  FlowPreparing |
  FlowPending |
  FlowSuccess |
  FlowError;

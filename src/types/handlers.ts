import { Transaction } from 'elastic-apm-node'
import { IWitnessServerSocket } from 'src/types/client'
import { Logger } from 'src/types/general'
import { RPCRequestData, RPCResponseData, RPCType } from 'src/types/rpc'

export type RPCHandlerMetadata = {
	logger: Logger
	tx?: Transaction
	client: IWitnessServerSocket
}

export type RPCHandler<R extends RPCType> = (
	data: RPCRequestData<R>,
	ctx: RPCHandlerMetadata
) => Promise<RPCResponseData<R>>
import { useCallback, useContext } from 'react';
import useData from './useRxData';
import { RxCollection, RxDocument } from 'rxdb';
import Context from './context';

export interface RxDocumentRet<T> {
	result?: T | RxDocument<T>;
	isFetching: boolean;
}

export interface RxDocumentJSON<T> extends RxDocumentRet<T> {
	result?: T;
}

export interface RxDocumentDoc<T> extends RxDocumentRet<T> {
	result?: RxDocument<T>;
}

export interface UseRxDocumentOptions {
	idAttribute?: string;
	json?: boolean;
}

function useRxDocument<T>(
	collectionName: string,
	id?: string,
	options?: UseRxDocumentOptions & { json: true }
): RxDocumentJSON<T>;

function useRxDocument<T>(
	collectionName: string,
	id?: string,
	options?: UseRxDocumentOptions & { json?: false }
): RxDocumentDoc<T>;

/**
 * Searches for a single document by an id attribute.
 */
function useRxDocument<T>(
	collectionName: string,
	id?: string,
	options: UseRxDocumentOptions = {}
): RxDocumentRet<T> {
	const { idAttribute, json } = options;

	const context = useContext(Context);
	const preferredIdAttribute = idAttribute || context.idAttribute;

	/**
	 * As a means of holding off data fetching when id is missing
	 * don't return a valid RxQuery object
	 */
	const queryConstructor = useCallback(
		(c: RxCollection<T>) =>
			id
				? c
						.find()
						.where(preferredIdAttribute)
						.equals(id)
				: undefined,
		[id, preferredIdAttribute]
	);

	// get around type-narrowing issue
	// TODO: find a better workaround
	const { result, isFetching } = json
		? // eslint-disable-next-line react-hooks/rules-of-hooks
		  useData<T>(collectionName, queryConstructor, { json: true })
		: // eslint-disable-next-line react-hooks/rules-of-hooks
		  useData<T>(collectionName, queryConstructor, { json: false });

	return { result: result[0], isFetching };
}

export default useRxDocument;

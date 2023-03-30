#include<bits/stdc++.h>
using namespace std;
int main()
{
    int arr[]={2,5,1,3,8};

    for(int i=1;i<5;i++)
    {
    
        int j=i-1;
        while(arr[i]<arr[j] and j>=0)
        {
            arr[j+1]=arr[j];
            j--;
        }

        arr[j+1]=arr[i];
    }

    for(int i=0;i<5;i++)
    {
        cout<<arr[i]<<endl;
    }
}
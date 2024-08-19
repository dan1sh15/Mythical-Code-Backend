#include <iostream>
using namespace std;

int main() {

    int t;
    cin >> t;

    while(t--) {
        int n, sum;
        cin >> n >> sum;

        int a[n];
        for(int i=0; i<n; i++) cin >> a[i];
        int num1,num2;
        for(int i=0; i<n-1; i++) {
            for(int j=i+1; j<n; j++) {
                if(a[i] + a[j] == sum) {
                    num1 = i+1, num2 = j+1;
                    break;
                }
            }
        }

        cout << num1 << " " << num2 << endl;
    }

    return 0;
}